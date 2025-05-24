import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis/client';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/redis/client';
import { generateResponse } from '@/lib/ollama';
import { parse } from 'csv-parse/sync';
import { readFile } from 'fs/promises';

async function getOrCreateChatSession(fileId: string) {
  let chatSession = await prisma.chatSession.findFirst({
    where: { fileId }
  });

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

async function processCSVData(filePath: string) {
  const fileContent = await readFile(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
  return records;
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

    // Get file data
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Process CSV data
    const csvData = await processCSVData(file.path);

    // Get chat history from Redis cache
    const chatHistory = await redis.get(`${CACHE_KEYS.CHAT_SESSION}${chatSession.id}`);
    const history = chatHistory ? JSON.parse(chatHistory) : [];

    // Prepare context for Ollama
    const context = `You are analyzing a CSV file with the following columns: ${Object.keys(csvData[0]).join(', ')}. 
    The file contains ${csvData.length} rows of data.
    
    Previous conversation context:
    ${history.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
    
    Current data sample (first 5 rows):
    ${JSON.stringify(csvData.slice(0, 5), null, 2)}`;

    // Generate response using Ollama
    const ollamaResponse = await generateResponse(`${context}\n\nUser question: ${content}`);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        content: ollamaResponse.response,
        role: 'assistant',
        chatSessionId: chatSession.id,
      },
    });

    // Update chat history in Redis
    const updatedHistory = [
      ...history,
      { role: 'user', content },
      { role: 'assistant', content: ollamaResponse.response }
    ];
    await redis.set(
      `${CACHE_KEYS.CHAT_SESSION}${chatSession.id}`,
      JSON.stringify(updatedHistory),
      'EX',
      CACHE_TTL.CHAT_SESSION
    );

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
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