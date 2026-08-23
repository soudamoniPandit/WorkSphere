import { NextRequest } from 'next/server';
import { ProposalController } from '@/lib/server/controllers/proposal.controller';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return ProposalController.submitProposal(req, params);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return ProposalController.getProposalsForProject(req, params);
}
