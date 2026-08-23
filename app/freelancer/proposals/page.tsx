'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { proposalService } from '@/services/proposalService';
import { authService } from '@/services/authService';
import { chatService } from '@/services/chatService';
import {
  FileText,
  DollarSign,
  Clock,
  Compass,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  User,
  Star,
  ArrowRight,
} from 'lucide-react';

export default function FreelancerProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProposals = async () => {
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
        setProposals(res.data);
      } else {
        setError(res.message || 'Failed to fetch your proposals');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProposals();
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
              <Sparkles size={12} /> Freelancer Workspace
            </span>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text-main)', marginBottom: '8px' }}>
              My Submitted <span style={{ color: 'var(--accent-pink)' }}>Proposals</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Track review progress, candidate shortlists, and launch discussions with client hiring managers.
            </p>
          </div>

          <Link
            href="/projects"
            className="btn-primary"
            style={{ padding: '12px 22px' }}
          >
            <Compass size={18} /> Find More Projects
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
            <p style={{ fontSize: '1.1rem' }}>Loading your submitted proposals...</p>
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ width: '100%', padding: '18px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        ) : proposals.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px' }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>No proposals submitted yet</h3>
            <p style={{ marginBottom: '24px' }}>Explore open projects in the marketplace and submit your first pitch to clients.</p>
            <Link href="/projects" className="btn-primary" style={{ padding: '12px 24px' }}>
              Explore Projects
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {proposals.map((prop) => {
              const project = prop.project;
              const clientUser = project?.client?.user;
              const isAccepted = prop.status === 'ACCEPTED';
              const isShortlisted = prop.status === 'SHORTLISTED';
              const isRejected = prop.status === 'REJECTED';
              const canChat = isShortlisted || isAccepted;

              return (
                <div
                  key={prop.id}
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: '28px',
                    borderRadius: '16px',
                    border: isAccepted
                      ? '1.5px solid var(--accent-success)'
                      : isShortlisted
                      ? '1.5px solid var(--border-pink)'
                      : '1px solid var(--border-color)',
                    background: 'var(--bg-panel)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span
                          className={`badge ${
                            isAccepted
                              ? 'badge-success'
                              : isShortlisted
                              ? 'badge-pink'
                              : isRejected
                              ? 'badge-error'
                              : 'badge-violet'
                          }`}
                          style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                        >
                          {prop.status}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                          Submitted on {new Date(prop.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="editorial-title" style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
                        <Link href={`/projects/${project?.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                          {project?.title}
                        </Link>
                      </h2>

                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} className="text-aqua" /> Client: <strong style={{ color: 'var(--text-main)' }}>{clientUser?.fullName || 'Client'}</strong> • Budget: ${project?.budget?.toLocaleString()} USD
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                        ${prop.proposedPrice?.toLocaleString()} USD
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {prop.estimatedDays} days delivery
                      </div>
                    </div>
                  </div>

                  {/* Cover letter snippet */}
                  <div
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-lavender)', fontWeight: '700', marginBottom: '4px' }}>
                      Your Pitch & Plan:
                    </div>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {prop.coverLetter}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div>
                      {isShortlisted && (
                        <span className="badge badge-pink">
                          <Sparkles size={13} /> You are shortlisted! Chat with the client below.
                        </span>
                      )}
                      {isAccepted && (
                        <span className="badge badge-success">
                          <CheckCircle2 size={13} /> Proposal Accepted! This project is now active in My Work.
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {canChat && (
                        <button
                          onClick={() => handleStartChat(project.id, clientUser?.id)}
                          className="btn-primary"
                          style={{
                            padding: '7px 16px',
                            fontSize: '0.85rem',
                            gap: '6px',
                            borderRadius: '8px',
                          }}
                        >
                          <MessageSquare size={15} /> Chat with Client
                        </button>
                      )}

                      <Link
                        href={`/projects/${project?.id}`}
                        className="btn-secondary"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                        }}
                      >
                        View project <ArrowRight size={14} />
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
