import { NextRequest } from 'next/server';
import { ProposalController } from '@/lib/server/controllers/proposal.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return ProposalController.getProposalById(req, params);
}
