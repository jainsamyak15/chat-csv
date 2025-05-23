import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis/client';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/redis/client';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');
    const query = searchParams.get('query');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Check Redis cache first
    const cacheKey = `${CACHE_KEYS.ANALYTICS}${fileId}:${query}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Get file from database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read and parse CSV file
    const fileContent = await readFile(file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    if (!records || records.length === 0) {
      return NextResponse.json({
        labels: [],
        datasets: [{
          label: 'No data',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }],
      });
    }

    // Process data based on query
    let visualizationData;
    if (query?.includes('distribution')) {
      // Example: Generate histogram data
      const column = query.split('distribution of ')[1];
      const values = records.map((r: any) => r[column]);
      const counts = values.reduce((acc: any, val: any) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

      visualizationData = {
        labels: Object.keys(counts),
        datasets: [{
          label: `Distribution of ${column}`,
          data: Object.values(counts),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }],
      };
    } else {
      // Get the first numeric column for visualization
      const columns = Object.keys(records[0] || {});
      
      // Find a numeric column to use for the chart
      let numericColumn = '';
      for (const col of columns) {
        // Skip empty column names
        if (!col.trim()) continue;
        
        // Check if the column has numeric values
        const hasNumericValues = records.some((r: any) => !isNaN(parseFloat(r[col])));
        if (hasNumericValues) {
          numericColumn = col;
          break;
        }
      }
      
      if (numericColumn) {
        // Use row indices as labels if no suitable label column
        const labels = records.slice(0, 10).map((_: any, i: number) => `Row ${i+1}`);
        const data = records.slice(0, 10).map((r: any) => parseFloat(r[numericColumn]) || 0);
        
        visualizationData = {
          labels,
          datasets: [{
            label: numericColumn,
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          }],
        };
      } else {
        // If no numeric column found, just show counts of entries
        visualizationData = {
          labels: ['Dataset Entries'],
          datasets: [{
            label: 'Number of Records',
            data: [records.length],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          }],
        };
      }
    }

    // Cache the result
    await redis.setex(
      cacheKey,
      CACHE_TTL.ANALYTICS_RESULT,
      JSON.stringify(visualizationData)
    );

    return NextResponse.json(visualizationData);
  } catch (error) {
    console.error('Visualization error:', error);
    return NextResponse.json({
      labels: ['Error'],
      datasets: [{
        label: 'Failed to generate visualization',
        data: [0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }],
    });
  }
} 