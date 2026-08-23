import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '../services/chat.service';
import { getAuthUser, requireRole, AppError } from '../auth';
import { Role } from '@prisma/client';

export class ChatController {
  static async getConversations(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      const conversations = await ChatService.getConversations(user.userId);

      return NextResponse.json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async createConversation(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.CLIENT, Role.FREELANCER]);

      const body = await req.json();
      const { projectId, otherUserId } = body;

      if (!projectId || !otherUserId) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields: projectId, otherUserId' },
          { status: 400 }
        );
      }

      const conversation = await ChatService.getOrCreateConversation(
        user.userId,
        user.role,
        projectId,
        otherUserId
      );

      return NextResponse.json(
        {
          success: true,
          data: conversation,
        },
        { status: 200 }
      );
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async getMessages(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      const result = await ChatService.getMessages(user.userId, params.id);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async sendMessage(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      const body = await req.json();
      const { content } = body;

      if (!content || !content.trim()) {
        return NextResponse.json(
          { success: false, message: 'Message content cannot be empty' },
          { status: 400 }
        );
      }

      const message = await ChatService.sendMessage(user.userId, params.id, content);

      return NextResponse.json(
        {
          success: true,
          data: message,
        },
        { status: 201 }
      );
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }
}
