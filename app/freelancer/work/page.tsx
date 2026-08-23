'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { proposalService } from '@/services/proposalService';
import { authService } from '@/services/authService';
import { chatService } from '@/services/chatService';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function FreelancerWorkPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await authService.getMe();
      if (!userRes.success || userRes.data?.role !== 'FREELANCER') {
        router.push('/login');
        return;
      }

      const res = await proposalService.getMyProposals();
      if (res.success && res.data) {
        // Filter only ACCEPTED proposals (active contracts)
        const accepted = res.data.filter((p: any) => p.status === 'ACCEPTED');
        setContracts(accepted);
      } else {
        setError(res.message || 'Failed to load active contracts');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleStartChat = async (projectId: string, clientUserId: string) => {
    try {
      const res = await chatService.createConversation({
        projectId,
        otherUserId: clientUserId,
      });

      if (res.success && res.data) {
        router.push('/messages');
      } else {
        alert(res.message || 'Could not launch conversation');
      }
    } catch (err: any) {
      alert(err.message || 'Error launching chat');
    }
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '36px 24px 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px', marginBottom: '8px' }}>
              <Sparkles size={12} /> Active Engagements
            </span>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text-main)', marginBottom: '8px' }}>
              My Active <span style={{ color: 'var(--accent-aqua)' }}>Contracts</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Manage ongoing project milestones, communicate with clients, and deliver high quality work.
            </p>
          </div>

          <Link href="/projects" className="btn-primary" style={{ padding: '12px 22px' }}>
            <Briefcase size={18} /> Find More Work
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
            <p style={{ fontSize: '1.1rem' }}>Loading your active contracts...</p>
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ width: '100%', padding: '18px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        ) : contracts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px' }}>
            <Briefcase size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              No active contracts yet
            </h3>
            <p style={{ marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
              When a client accepts your proposal, the project becomes an active contract and will appear here with live client collaboration tools.
            </p>
            <Link href="/projects" className="btn-primary" style={{ padding: '12px 24px' }}>
              Explore Projects
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {contracts.map((contract) => {
              const project = contract.project;
              const clientUser = project?.client?.user;

              return (
                <div
                  key={contract.id}
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: '28px',
                    borderRadius: '18px',
                    background: 'var(--bg-panel)',
                    border: '1.5px solid var(--accent-success)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                          <CheckCircle2 size={12} /> ACTIVE CONTRACT
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                          Accepted on {new Date(contract.updatedAt || contract.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="editorial-title" style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
                        <Link href={`/projects/${project?.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                          {project?.title}
                        </Link>
                      </h2>

                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} className="text-aqua" /> Client: <strong style={{ color: 'var(--text-main)' }}>{clientUser?.fullName || 'Client'}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                        ${contract.proposedPrice?.toLocaleString()} USD
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Turnaround: {contract.estimatedDays} days
                      </div>
                    </div>
                  </div>

                  {/* Project description snippet */}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                    {project?.description}
                  </p>

                  {/* Bottom Bar: Chat & Project details link */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-aqua)', fontSize: '0.88rem' }}>
                      <ShieldCheck size={16} /> Payment Protected in Escrow
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleStartChat(project.id, clientUser?.id)}
                        className="btn-primary"
                        style={{
                          padding: '8px 18px',
                          fontSize: '0.88rem',
                          gap: '6px',
                          borderRadius: '8px',
                        }}
                      >
                        <MessageSquare size={15} /> Open Project Chat
                      </button>

                      <Link
                        href={`/projects/${project?.id}`}
                        className="btn-secondary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.88rem',
                          borderRadius: '8px',
                        }}
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
