'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
import { proposalService } from '@/services/proposalService';
import { authService } from '@/services/authService';
import { chatService } from '@/services/chatService';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Layers,
  Code,
  ShoppingBag,
  Rocket,
  ShieldCheck,
  Star,
  Lock,
  MessageSquare,
  FileText,
  UploadCloud,
  Check,
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [myProposal, setMyProposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proposal Form State
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('8');
  const [coverLetter, setCoverLetter] = useState(
    'I would love to build a fast, modern website that captures your brand and delivers an exceptional user experience.\n\nWith relevant experience in delivering production web applications, I ensure clean, responsive UI, reliable performance, and on-time delivery.\n\nLooking forward to collaborating!'
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await authService.getMe();
      if (userRes.success && userRes.data) {
        setCurrentUser(userRes.data);
      }

      const res = await projectService.getProjectById(projectId);
      if (res.success && res.data) {
        setProject(res.data);
        setProposedPrice(res.data.budget?.toString() || '2500');
      } else {
        setError(res.message || 'Project not found');
      }

      // Check if freelancer already has a proposal for this project
      if (userRes.data?.role === 'FREELANCER') {
        const propRes = await proposalService.getMyProposals();
        if (propRes.success && propRes.data) {
          const match = propRes.data.find((p: any) => p.projectId === projectId);
          if (match) setMyProposal(match);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim() || !proposedPrice || !estimatedDays) {
      setSubmitError('Please fill in your bid price, delivery time, and cover letter.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await proposalService.submitProposal(projectId, {
        coverLetter,
        proposedPrice: parseFloat(proposedPrice),
        estimatedDays: parseInt(estimatedDays, 10) || 7,
      });

      if (res.success && res.data) {
        setMyProposal(res.data);
      } else {
        setSubmitError(res.message || 'Failed to submit proposal.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async (clientUserId: string) => {
    try {
      const res = await chatService.createConversation({
        projectId,
        otherUserId: clientUserId,
      });

      if (res.success && res.data) {
        router.push('/messages');
      } else {
        alert(res.message || 'Could not initiate chat');
      }
    } catch (err: any) {
      alert(err.message || 'Error launching chat');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
        <p style={{ fontSize: '1.1rem' }}>Loading project details & proposal pitch workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={18} /> Back to projects
        </Link>
        <div className="badge badge-error" style={{ width: '100%', padding: '20px', justifyContent: 'center', fontSize: '0.95rem' }}>
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  const clientUser = project.client?.user;
  const clientProfile = project.client;
  const isClientOwner = currentUser?.role === 'CLIENT' && clientUser?.id === currentUser?.id;
  const isFreelancer = currentUser?.role === 'FREELANCER';

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '28px 24px 80px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-pink)',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: '600',
            }}
          >
            <ArrowLeft size={16} /> Back to projects
          </Link>
        </div>

        {/* ================= MAIN EDITORIAL LAYOUT (Reference Image 1) ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(380px, 0.95fr)',
            gap: '36px',
            alignItems: 'start',
          }}
          className="project-editorial-grid"
        >
          {/* ================= LEFT COLUMN: PROJECT DETAILS ================= */}
          <div>
            {/* Editorial Title & Inline Client Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: '1 1 360px' }}>
                <h1
                  className="editorial-title"
                  style={{
                    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                    color: 'var(--text-main)',
                    lineHeight: 1.15,
                    position: 'relative',
                    display: 'inline-block',
                  }}
                >
                  {project.title}
                </h1>
              </div>

              {/* Client Info Card Inline */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '10px 16px',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F48AC2 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '1.2rem',
                  }}
                >
                  {clientUser?.fullName ? clientUser.fullName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.96rem', color: 'var(--text-main)' }}>
                      {clientUser?.fullName || 'Arjun Malhotra'}
                    </span>
                    <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {clientProfile?.companyName ? `Founder, ${clientProfile.companyName}` : 'Project Client'}
                    {clientProfile?.location && ` • ${clientProfile.location}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-pink)', marginTop: '2px' }}>
                    <Star size={12} fill="var(--accent-pink)" /> 4.9 <span style={{ color: 'var(--text-dim)' }}>(32 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Row: Bookmark, Time, Proposals Count, Shortlist Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', color: 'var(--text-muted)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setBookmarked(!bookmarked)}
                style={{
                  background: bookmarked ? 'var(--accent-pink-subtle)' : 'var(--bg-surface)',
                  border: `1px solid ${bookmarked ? 'var(--border-pink)' : 'var(--border-color)'}`,
                  color: bookmarked ? 'var(--accent-pink)' : 'var(--text-muted)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Bookmark size={15} fill={bookmarked ? 'var(--accent-pink)' : 'none'} />
              </button>

              <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{project._count?.proposals || project.proposals?.length || 0} Proposals</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-pink)' }}>
                Shortlist in progress <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-pink)' }} />
              </span>
            </div>

            {/* Project Brief Section */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px' }}>
                Project brief
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
                {project.description}
              </p>
            </div>

            {/* Scope of Work Grid (4 Visual Tiles matching Image 1) */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
                Scope of work
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '14px',
                }}
              >
                <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
                  <div style={{ color: 'var(--accent-pink)', marginBottom: '10px' }}>
                    <Layers size={22} />
                  </div>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Design
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    Create a clean, modern UI that reflects our brand and delivers a great mobile experience.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
                  <div style={{ color: 'var(--accent-violet)', marginBottom: '10px' }}>
                    <Code size={22} />
                  </div>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Development
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    Build a responsive website with a CMS for menu & content updates.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
                  <div style={{ color: 'var(--accent-pink)', marginBottom: '10px' }}>
                    <ShoppingBag size={22} />
                  </div>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Integrations
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    Integrate online ordering (existing provider) and Google Maps for locations.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
                  <div style={{ color: 'var(--accent-aqua)', marginBottom: '10px' }}>
                    <Rocket size={22} />
                  </div>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Launch & Support
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    Test across devices, optimize performance, and assist with deployment.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills & Technologies Pills */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                Skills & technologies
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.skills?.map((item: any) => (
                  <span
                    key={item.skill.name}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      padding: '7px 16px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {item.skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual References Gallery (Matching Reference Image 1) */}
            <div style={{ marginBottom: '36px', position: 'relative' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                Visual references
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '16px',
                }}
                className="visual-ref-grid"
              >
                {[
                  { title: 'Good food fast, not fast food.', bg: '#1E1224' },
                  { title: 'Fresh meals delivered to you', bg: '#F8F5EC', darkText: true },
                  { title: 'Healthy. Tasty. Delivered.', bg: '#F6F3EE', darkText: true },
                  { title: 'Flavors you love, delivered hot.', bg: '#180E1C' },
                ].map((thumb, idx) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      height: '110px',
                      borderRadius: '12px',
                      padding: '12px',
                      background: thumb.bg,
                      color: thumb.darkText ? '#22122E' : '#F8F5FC',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', lineHeight: 1.25 }}>
                      {thumb.title}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-pink)', opacity: 0.8 }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-aqua)', opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Hand-drawn Annotation Note with curved arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '80px' }}>
                <span style={{ color: 'var(--accent-pink)', fontSize: '1.2rem', transform: 'rotate(-20deg)' }}>↵</span>
                <span className="hand-note">
                  Love the clean layout and bold typography in these designs.
                </span>
              </div>
            </div>

            {/* Bottom Metadata Tiles: Timeline & Budget */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-violet)', padding: '12px', borderRadius: '12px' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>Timeline</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>7 – 10 days</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Expected delivery</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '12px', borderRadius: '12px' }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>Budget</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                    ${project.budget.toLocaleString()} USD
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fixed price contract</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY SEND A PROPOSAL CARD ================= */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                borderRadius: '20px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              {/* If Client Owner */}
              {isClientOwner ? (
                <div>
                  <h2 className="editorial-title" style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                    Project Management
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
                    You are viewing your posted project listing.
                  </p>
                  <Link
                    href={`/client/projects/${project.id}/proposals`}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                  >
                    <FileText size={18} /> Review Received Proposals ({project._count?.proposals || 0})
                  </Link>
                </div>
              ) : myProposal ? (
                /* Already Submitted Proposal Card */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CheckCircle2 size={22} className="text-aqua" />
                    <h2 className="editorial-title" style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
                      Proposal Submitted
                    </h2>
                  </div>

                  <div style={{ display: 'inline-block', marginBottom: '16px' }}>
                    <span
                      className={`badge ${
                        myProposal.status === 'ACCEPTED'
                          ? 'badge-success'
                          : myProposal.status === 'SHORTLISTED'
                          ? 'badge-pink'
                          : 'badge-violet'
                      }`}
                      style={{ fontSize: '0.85rem', padding: '4px 14px' }}
                    >
                      Status: {myProposal.status}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Your Bid: <strong className="text-pink">${myProposal.proposedPrice} USD</strong>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Delivery: <strong>{myProposal.estimatedDays} days</strong>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {myProposal.coverLetter}
                    </p>
                  </div>

                  {(myProposal.status === 'SHORTLISTED' || myProposal.status === 'ACCEPTED') && (
                    <button
                      onClick={() => handleStartChat(clientUser?.id)}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    >
                      <MessageSquare size={16} /> Open Direct Chat with Client
                    </button>
                  )}
                </div>
              ) : isFreelancer ? (
                /* Proposal Form matching Reference Image 1 */
                <div>
                  <h2 className="editorial-title" style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '18px' }}>
                    Send a proposal
                  </h2>

                  {/* 3-Step Stepper Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--accent-aqua)',
                          color: '#160D1E',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        1
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-aqua)' }}>
                        Your pitch
                      </span>
                    </div>

                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', margin: '0 8px', position: 'relative', top: '-10px' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--bg-surface-elevated)',
                          color: 'var(--text-dim)',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        2
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Client review</span>
                    </div>

                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', margin: '0 8px', position: 'relative', top: '-10px' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--bg-surface-elevated)',
                          color: 'var(--text-dim)',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        3
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Collaboration</span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="badge badge-error" style={{ width: '100%', padding: '10px', marginBottom: '18px', justifyContent: 'center' }}>
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmitProposal}>
                    {/* Your Bid Input */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <label style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          Your bid ($ USD)
                        </label>
                        <Info size={14} className="text-dim" />
                      </div>
                      <input
                        type="number"
                        placeholder="2500"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        required
                        min="1"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          fontWeight: '600',
                        }}
                      />
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-aqua)', marginTop: '4px' }}>
                        Within client budget (${project.budget.toLocaleString()})
                      </div>
                    </div>

                    {/* Delivery Time Select */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <label style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          Delivery time
                        </label>
                        <Info size={14} className="text-dim" />
                      </div>
                      <select
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-main)',
                          fontSize: '0.92rem',
                        }}
                      >
                        <option value="3">3 days</option>
                        <option value="5">5 days</option>
                        <option value="8">8 days</option>
                        <option value="12">12 days</option>
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                      </select>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Proposals due in 4 days
                      </div>
                    </div>

                    {/* Cover Letter Textarea with Character Counter */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            Cover letter (preview)
                          </label>
                          <Info size={14} className="text-dim" />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          {coverLetter.length} / 1200
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        maxLength={1200}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          lineHeight: '1.6',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    {/* Attachment Dropzone & Annotation Note (Matching Image 1) */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px' }}>
                        Attachment (optional)
                      </div>
                      <div
                        style={{
                          border: '1.5px dashed var(--border-color)',
                          borderRadius: '12px',
                          padding: '18px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          background: 'var(--bg-input)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UploadCloud size={24} className="text-aqua" />
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Attach PDF, screenshots or design samples
                          </div>
                        </div>

                        {/* Hand-drawn note */}
                        <div className="hand-note" style={{ maxWidth: '140px', fontSize: '0.95rem' }}>
                          Drop a file or image to share your relevant work.
                        </div>
                      </div>
                    </div>

                    {/* Submit Proposal CTA */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '13px',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        borderRadius: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      {submitting ? 'Submitting pitch...' : <><span>Submit proposal</span> <ArrowRight size={16} /></>}
                    </button>

                    {/* Security Lock Note */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      <Lock size={13} /> Your proposal is only visible to the client.
                    </div>
                  </form>
                </div>
              ) : !currentUser ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <h2 className="editorial-title" style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                    Ready to pitch?
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                    Sign in with your verified Freelancer account to submit your proposal.
                  </p>
                  <Link
                    href="/login"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    Log In to Send Proposal
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .project-editorial-grid {
            grid-template-columns: 1fr !important;
          }
          .visual-ref-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
