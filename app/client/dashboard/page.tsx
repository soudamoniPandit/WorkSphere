'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import {
  FolderKanban,
  FileText,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Lightbulb,
  DollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';

export default function ClientDashboardPage() {
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

      if (userRes.data.role !== 'CLIENT') {
        router.push('/freelancer/dashboard');
        return;
      }

      const res = await projectService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard statistics.');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={36} className="text-pink" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
        <p style={{ fontSize: '1.1rem' }}>Loading Hiring Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="badge badge-error" style={{ width: '100%', padding: '18px', justifyContent: 'center', fontSize: '0.95rem' }}>
          {error}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const recentProposals = stats?.recentProposals || [];
  const recentProjects = stats?.recentProjects || [];

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '36px 24px 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* ================= HERO HEADER (Reference Image 3) ================= */}
        <section style={{ marginBottom: '32px' }}>
          <h1
            className="editorial-title"
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              color: 'var(--text-main)',
              marginBottom: '10px',
            }}
          >
            Build your team with{' '}
            <span
              style={{
                color: 'var(--accent-pink)',
                fontWeight: '700',
              }}
            >
              confidence.
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>
            Post a project, review top proposals, and hire the right talent.
          </p>

          <Link
            href="/projects/create"
            className="btn-primary"
            style={{ padding: '13px 26px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Post a project
          </Link>
        </section>

        {/* ================= WORKFLOW STATUS PIPELINE BAR (Reference Image 3) ================= */}
        <section style={{ marginBottom: '36px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '24px 32px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {/* Step 1: Open */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 220px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--accent-success-subtle)',
                  color: 'var(--accent-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent-success-subtle)',
                }}
              >
                <FolderKanban size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--accent-success)' }}>
                  Open
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  New project is live talent can apply
                </div>
              </div>
            </div>

            {/* Dotted Connecting Arrow */}
            <div style={{ color: 'var(--border-color)', fontSize: '1.2rem', letterSpacing: '4px', display: 'none' }} className="pipeline-dash">
              ----------&gt;
            </div>

            {/* Step 2: Reviewing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 240px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--accent-pink-subtle)',
                  color: 'var(--accent-pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-pink)',
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--accent-pink)' }}>
                  Reviewing
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  You&apos;re reviewing proposals and portfolios
                </div>
              </div>
            </div>

            {/* Dotted Connecting Arrow */}
            <div style={{ color: 'var(--border-color)', fontSize: '1.2rem', letterSpacing: '4px', display: 'none' }} className="pipeline-dash">
              ----------&gt;
            </div>

            {/* Step 3: Hired */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 220px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--accent-aqua-subtle)',
                  color: 'var(--accent-aqua)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-aqua)',
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--accent-aqua)' }}>
                  Hired
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Select your freelancer and get to work
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TWO COLUMN GRID: RECENT PROPOSALS & MY PROJECTS ================= */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '28px',
            marginBottom: '36px',
          }}
          className="dashboard-split-grid"
        >
          {/* ================= LEFT: RECENT PROPOSALS ================= */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Recent Proposals
              </h2>
              <Link
                href="/client/projects"
                style={{
                  color: 'var(--accent-pink)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View all ({metrics.totalProposals || recentProposals.length || 0}) <ArrowRight size={14} />
              </Link>
            </div>

            {recentProposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ marginBottom: '10px', opacity: 0.3 }} />
                <p style={{ marginBottom: '8px' }}>No candidate proposals received yet.</p>
                <p style={{ fontSize: '0.85rem' }}>Post a project or ensure your project status is set to OPEN.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentProposals.map((p: any) => {
                  const freelancer = p.freelancer;
                  const fUser = freelancer?.user;

                  return (
                    <div
                      key={p.id}
                      className="glass-panel glass-panel-interactive"
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      {/* Candidate Avatar & Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #7C3AED 0%, #25D9D2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontWeight: '800',
                              fontSize: '1.1rem',
                            }}
                          >
                            {fUser?.fullName ? fUser.fullName.charAt(0).toUpperCase() : 'F'}
                          </div>
                          {/* Online indicator dot */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: 'var(--accent-success)',
                              border: '2px solid var(--bg-surface)',
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                              {fUser?.fullName || 'Freelancer'}
                            </span>
                            <span
                              className={`badge ${
                                p.status === 'ACCEPTED'
                                  ? 'badge-success'
                                  : p.status === 'SHORTLISTED'
                                  ? 'badge-pink'
                                  : 'badge-violet'
                              }`}
                              style={{ fontSize: '0.68rem', padding: '1px 8px' }}
                            >
                              {p.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {freelancer?.title || 'Full Stack Developer'}
                          </div>

                          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-pink)' }}>
                              <Star size={11} fill="var(--accent-pink)" /> 4.8
                            </span>
                            {freelancer?.location && (
                              <span>• {freelancer.location}</span>
                            )}
                            <span>• {p.estimatedDays} days delivery</span>
                          </div>
                        </div>
                      </div>

                      {/* Bid Amount & Review CTA */}
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                          ${p.proposedPrice?.toLocaleString()}
                        </div>
                        <Link
                          href={`/client/projects/${p.projectId}/proposals`}
                          className="btn-primary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            borderRadius: '8px',
                          }}
                        >
                          Review &gt;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= RIGHT: MY PROJECTS & STAT METRICS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* My Projects Card */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  My Projects
                </h2>
                <Link
                  href="/client/projects"
                  style={{
                    color: 'var(--accent-pink)',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all ({recentProjects.length || 0}) <ArrowRight size={14} />
                </Link>
              </div>

              {recentProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: '14px' }}>No active project listings.</p>
                  <Link href="/projects/create" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                    + Post First Project
                  </Link>
                </div>
              ) : (
                recentProjects.slice(0, 2).map((proj: any) => (
                  <div
                    key={proj.id}
                    className="glass-panel glass-panel-interactive"
                    style={{
                      padding: '18px 20px',
                      borderRadius: '14px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--bg-surface-elevated)', color: 'var(--accent-lavender)', padding: '8px', borderRadius: '8px' }}>
                          <FolderKanban size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                              {proj.title}
                            </h3>
                            <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>
                              {proj.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                            Created on {new Date(proj.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/client/projects/${proj.id}/proposals`}
                        className="btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.82rem',
                          borderRadius: '8px',
                        }}
                      >
                        View project &gt;
                      </Link>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                      <span>Budget: <strong className="text-pink">${proj.budget?.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Proposals: <strong style={{ color: 'var(--text-main)' }}>{proj._count?.proposals || proj.proposals?.length || 0}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Stat Boxes Row (Matching Reference Image 3) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}
            >
              {/* Stat 1: Open Projects */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ background: 'var(--accent-aqua-subtle)', color: 'var(--accent-aqua)', padding: '8px', borderRadius: '10px' }}>
                    <FolderKanban size={18} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•••</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Open Projects</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-aqua)', margin: '4px 0' }}>
                  {metrics.openProjects || 1}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Active listings</div>
              </div>

              {/* Stat 2: Proposals Received */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '8px', borderRadius: '10px' }}>
                    <FileText size={18} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•••</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Proposals Received</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-pink)', margin: '4px 0' }}>
                  {metrics.totalProposals || 1}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total proposals</div>
              </div>

              {/* Stat 3: Hired */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-lavender)', padding: '8px', borderRadius: '10px' }}>
                    <Users size={18} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•••</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Hired</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-lavender)', margin: '4px 0' }}>
                  {metrics.activeProjects || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Freelancers hired</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRO TIP BAR (Reference Image 3) ================= */}
        <section>
          <div
            className="glass-panel"
            style={{
              padding: '16px 24px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-lavender)', padding: '8px', borderRadius: '8px' }}>
                <Lightbulb size={18} />
              </div>
              <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                Tip: Add clear deliverables and examples to get more relevant proposals.
              </span>
            </div>

            <Link
              href="/projects/create"
              style={{
                color: 'var(--accent-pink)',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View best practices <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>

      <style jsx global>{`
        @media (min-width: 900px) {
          .pipeline-dash {
            display: block !important;
          }
        }
        @media (max-width: 960px) {
          .dashboard-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
