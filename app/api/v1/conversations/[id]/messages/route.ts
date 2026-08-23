import { NextRequest } from 'next/server';
import { ChatController } from '@/lib/server/controllers/chat.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return ChatController.getMessages(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return ChatController.sendMessage(req, params);
}
