import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import type { ChartType } from 'chart.js';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  console.log('Starting file upload process...');
  console.log('Database URL:', process.env.DATABASE_URL);
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    if (!file) {
      console.error('No file received in request');
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    console.log('Creating uploads directory at:', uploadsDir);
    await mkdir(uploadsDir, { recursive: true });

    // Save file to uploads directory
    const filePath = join(uploadsDir, file.name);
    console.log('Saving file to:', filePath);
    await writeFile(filePath, buffer);

    // Save file metadata to database
    console.log('Saving file metadata to database...');
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        path: filePath,
        size: file.size,
        type: file.type,
      },
    });
    console.log('File metadata saved successfully:', JSON.stringify(fileRecord, null, 2));

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 