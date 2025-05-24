import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Find chat session for this file
    const chatSession = await prisma.chatSession.findFirst({
      where: { fileId }
    });

    if (!chatSession) {
      // No chat session yet, return empty array
      return NextResponse.json([]);
    }

    const messages = await prisma.message.findMany({
      where: {
        chatSessionId: chatSession.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, chatSessionId } = body;

    if (!content || !chatSessionId) {
      return NextResponse.json(
        { error: 'Content and chatSessionId are required' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        chatSessionId,
        role: 'user'
      },
      include: {
        chatSession: {
          include: {
            file: true
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
} 