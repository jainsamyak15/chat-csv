import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { File } from '@prisma/client';

export async function GET() {
  console.log('Files API: Starting to fetch files from database...');
  console.log('Files API: Database URL:', process.env.DATABASE_URL);
  
  try {
    console.log('Files API: Executing Prisma query...');
    const files = await prisma.file.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Files API: Raw database response:', JSON.stringify(files, null, 2));
    console.log('Files API: Files fetched successfully:', {
      count: files.length,
      files: files.map((f: File) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt
      }))
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Files API: Error fetching files:', error);
    if (error instanceof Error) {
      console.error('Files API: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 