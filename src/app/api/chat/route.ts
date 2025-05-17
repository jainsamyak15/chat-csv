import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis/client';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/redis/client';

async function getOrCreateChatSession(fileId: string) {
  // Try to find an existing chat session for this file
  let chatSession = await prisma.chatSession.findFirst({
    where: { fileId }
  });

  // If no session exists, create one
  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        title: 'New Chat',
        fileId,
        userId: 'default'
      }
    });
  }

  return chatSession;
}

export async function POST(request: NextRequest) {
  try {
    const { content, fileId } = await request.json();
    if (!content || !fileId) {
      return NextResponse.json(
        { error: 'Message content and fileId are required' },
        { status: 400 }
      );
    }

    // Get or create chat session
    const chatSession = await getOrCreateChatSession(fileId);

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        chatSessionId: chatSession.id,
      },
    });

    // Get chat history from Redis cache
    const chatHistory = await redis.get(`${CACHE_KEYS.CHAT_SESSION}${chatSession.id}`);
    const history = chatHistory ? JSON.parse(chatHistory) : [];

    // Call local LLM (Ollama)
    const llmResponse = await fetch(`${process.env.OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt: content,
        context: history,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error('Failed to get LLM response');
    }

    const { response } = await llmResponse.json();

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        content: response,
        role: 'assistant',
        chatSessionId: chatSession.id,
      },
    });

    // Update chat history in Redis
    const updatedHistory = [...history, { role: 'user', content }, { role: 'assistant', content: response }];
    await redis.set(
      `${CACHE_KEYS.CHAT_SESSION}${chatSession.id}`,
      JSON.stringify(updatedHistory),
      'EX',
      CACHE_TTL.CHAT_SESSION
    );

    return NextResponse.json({ userMessage, assistantMessage });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Get or create chat session
    const chatSession = await getOrCreateChatSession(fileId);

    const messages = await prisma.message.findMany({
      where: {
        chatSessionId: chatSession.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 