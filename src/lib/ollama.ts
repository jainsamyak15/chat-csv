import { z } from 'zod';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama2';

const responseSchema = z.object({
  response: z.string(),
  context: z.array(z.number()).optional(),
});

export async function generateResponse(prompt: string, context?: number[]) {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        context,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    const parsed = responseSchema.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}