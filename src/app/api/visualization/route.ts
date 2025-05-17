import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';
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
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: `Distribution of ${column}`,
            data: Object.values(counts),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };
    } else {
      // Default: Show first 10 rows as a table
      visualizationData = {
        type: 'table',
        data: records.slice(0, 10),
      };
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
    return NextResponse.json(
      { error: 'Failed to generate visualization' },
      { status: 500 }
    );
  }
} 