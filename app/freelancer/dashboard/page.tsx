'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import {
  Compass,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Briefcase,
  ChevronRight,
  UserCheck,
  Zap,
  TrendingUp,
  DollarSign,
  Tag,
} from 'lucide-react';

export default function FreelancerDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await authService.getMe();
      if (!userRes.success || !userRes.data) {
        router.push('/login');
        return;
      }

      if (userRes.data.role !== 'FREELANCER') {
        router.push('/client/dashboard');
        return;
      }

      const res = await projectService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
        <p style={{ fontSize: '1.1rem' }}>Loading Freelancer Workspace & Opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="badge badge-error" style={{ width: '100%', padding: '18px', justifyContent: 'center', fontSize: '0.95rem' }}>
          {error}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const recentProposals = stats?.recentProposals || [];
  const availableProjects = stats?.availableProjects || [];

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: 'clamp(20px, 4vw, 36px) clamp(12px, 3.5vw, 24px) 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Welcome Header */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
              <Sparkles size={12} /> Freelancer Opportunity Workspace
            </span>
          </div>

          <h1
            className="editorial-title"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
              color: 'var(--text-main)',
              marginBottom: '10px',
            }}
          >
            Welcome back, <span style={{ color: 'var(--accent-aqua)' }}>{stats?.user?.fullName || 'Freelancer'}</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px', maxWidth: '680px' }}>
            Explore high-budget opportunities, track your active bids, and collaborate with verified clients.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/projects"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.98rem' }}
            >
              <Compass size={18} /> Explore open projects
            </Link>
            <Link
              href="/profile"
              className="btn-secondary"
              style={{ padding: '12px 22px', fontSize: '0.98rem' }}
            >
              <UserCheck size={18} className="text-aqua" /> Portfolio & Profile
            </Link>
          </div>
        </section>

        {/* Metrics Grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '14px',
            marginBottom: '36px',
          }}
        >
          <div className="glass-panel glass-panel-interactive" style={{ padding: '18px 20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>Available Projects</span>
              <div style={{ background: 'var(--accent-aqua-subtle)', color: 'var(--accent-aqua)', padding: '6px', borderRadius: '8px' }}>
                <Compass size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-aqua)' }}>
              {metrics.availableProjects || 0}
            </div>
          </div>

          <div className="glass-panel glass-panel-interactive" style={{ padding: '18px 20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>My Proposals</span>
              <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-violet)', padding: '6px', borderRadius: '8px' }}>
                <FileText size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {metrics.myProposals || 0}
            </div>
          </div>

          <div className="glass-panel glass-panel-interactive" style={{ padding: '18px 20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>Pending Review</span>
              <div style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>
              {metrics.pendingProposals || 0}
            </div>
          </div>

          <div className="glass-panel glass-panel-interactive" style={{ padding: '18px 20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>Shortlisted</span>
              <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '6px', borderRadius: '8px' }}>
                <Star size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
              {metrics.shortlistedProposals || 0}
            </div>
          </div>

          <div className="glass-panel glass-panel-interactive" style={{ padding: '18px 20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>Active Contracts</span>
              <div style={{ background: 'var(--accent-success-subtle)', color: 'var(--accent-success)', padding: '6px', borderRadius: '8px' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-success)' }}>
              {metrics.acceptedProposals || 0}
            </div>
          </div>
        </section>

        {/* Two Column Layout: Proposals & Opportunities */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: '24px',
          }}
          className="freelancer-dash-grid"
        >
          {/* Left: My Proposals Status */}
          <div className="glass-panel" style={{ padding: 'clamp(18px, 4vw, 28px)', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>My Proposals Status</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track review progress and client chats</p>
              </div>
              <Link href="/freelancer/proposals" style={{ color: 'var(--accent-pink)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700' }}>
                View all ({metrics.myProposals || 0}) →
              </Link>
            </div>

            {recentProposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ marginBottom: '10px', opacity: 0.3 }} />
                <p style={{ marginBottom: '14px' }}>You haven&apos;t submitted any proposals yet.</p>
                <Link href="/projects" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Browse Open Projects
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recentProposals.map((p: any) => {
                  const isShortlisted = p.status === 'SHORTLISTED';
                  const isAccepted = p.status === 'ACCEPTED';
                  const canChat = isShortlisted || isAccepted;

                  return (
                    <div
                      key={p.id}
                      className="glass-panel glass-panel-interactive"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '14px',
                        padding: '16px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.98rem', color: 'var(--text-main)' }}>
                            {p.project?.title}
                          </span>
                          <span
                            className={`badge ${
                              isAccepted
                                ? 'badge-success'
                                : isShortlisted
                                ? 'badge-pink'
                                : p.status === 'REJECTED'
                                ? 'badge-error'
                                : 'badge-violet'
                            }`}
                            style={{ fontSize: '0.68rem', padding: '1px 8px' }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Bid: <strong className="text-pink">${p.proposedPrice}</strong> • {p.estimatedDays} days delivery
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canChat ? (
                          <Link
                            href="/messages"
                            className="btn-primary"
                            style={{
                              padding: '7px 14px',
                              fontSize: '0.82rem',
                              gap: '4px',
                              borderRadius: '8px',
                            }}
                          >
                            <MessageSquare size={14} /> Chat
                          </Link>
                        ) : (
                          <Link
                            href={`/projects/${p.projectId}`}
                            className="btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.82rem',
                              borderRadius: '8px',
                            }}
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Available Opportunities */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>Available Opportunities</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Latest OPEN projects looking for specialists</p>
              </div>
              <Link href="/projects" style={{ color: 'var(--accent-pink)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700' }}>
                Explore All →
              </Link>
            </div>

            {availableProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Briefcase size={36} style={{ marginBottom: '10px', opacity: 0.3 }} />
                <p>No open projects found at this moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {availableProjects.map((proj: any) => (
                  <div
                    key={proj.id}
                    className="glass-panel glass-panel-interactive"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <h3 style={{ fontWeight: '800', fontSize: '0.98rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                        {proj.title}
                      </h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
                        Budget: <strong className="text-pink">${proj.budget?.toLocaleString()}</strong> • Client: {proj.client?.user?.fullName || 'Client'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {proj.skills?.map((item: any) => (
                          <span key={item.skill.name} className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                            {item.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/projects/${proj.id}`}
                      className="btn-primary"
                      style={{
                        padding: '7px 14px',
                        fontSize: '0.82rem',
                        whiteSpace: 'nowrap',
                        gap: '4px',
                        borderRadius: '8px',
                      }}
                    >
                      Apply Now <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .freelancer-dash-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
