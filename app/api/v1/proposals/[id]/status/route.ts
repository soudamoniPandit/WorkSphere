import { NextRequest } from 'next/server';
import { ProposalController } from '@/lib/server/controllers/proposal.controller';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return ProposalController.updateProposalStatus(req, params);
}
