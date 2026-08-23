import { NextRequest } from 'next/server';
import { ChatController } from '@/lib/server/controllers/chat.controller';

export async function GET(req: NextRequest) {
  return ChatController.getConversations(req);
}

export async function POST(req: NextRequest) {
  return ChatController.createConversation(req);
}
