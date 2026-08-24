import { NextRequest, NextResponse } from 'next/server';
import { ProposalService } from '../services/proposal.service';
import { getAuthUser, requireRole, AppError } from '../auth';
import { Role, ProposalStatus } from '@/types/database';

export class ProposalController {
  static async submitProposal(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.FREELANCER]);

      const projectId = params.id;
      const body = await req.json();
      const { coverLetter, proposedPrice, estimatedDays } = body;

      if (!coverLetter || proposedPrice === undefined || estimatedDays === undefined) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields: coverLetter, proposedPrice, estimatedDays' },
          { status: 400 }
        );
      }

      const proposal = await ProposalService.submitProposal(user.userId, projectId, {
        coverLetter,
        proposedPrice: Number(proposedPrice),
        estimatedDays: Number(estimatedDays),
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Proposal submitted successfully',
          data: proposal,
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

  static async getProposalsForProject(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      const projectId = params.id;

      const proposals = await ProposalService.getProposalsForProject(user.userId, user.role, projectId);

      return NextResponse.json({
        success: true,
        data: proposals,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async getMyProposals(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.FREELANCER]);

      const proposals = await ProposalService.getMyProposals(user.userId);

      return NextResponse.json({
        success: true,
        data: proposals,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async getProposalById(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      const proposal = await ProposalService.getProposalById(user.userId, user.role, params.id);

      return NextResponse.json({
        success: true,
        data: proposal,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async updateProposalStatus(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.CLIENT]);

      const body = await req.json();
      const { status } = body;

      if (!status || !Object.values(ProposalStatus).includes(status)) {
        return NextResponse.json(
          { success: false, message: `Invalid status. Must be one of: ${Object.values(ProposalStatus).join(', ')}` },
          { status: 400 }
        );
      }

      const updated = await ProposalService.updateProposalStatus(user.userId, params.id, status as ProposalStatus);

      return NextResponse.json({
        success: true,
        message: `Proposal status updated to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }
}
