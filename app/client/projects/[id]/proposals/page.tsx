'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { proposalService, ProposalStatus } from '@/services/proposalService';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import { chatService } from '@/services/chatService';
import { reviewService } from '@/services/reviewService';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ExternalLink,
  Briefcase,
  Star,
  Sparkles,
  Calendar,
  Wallet,
  Users,
  Edit,
  X,
  FileText,
  Activity,
  Bookmark,
  Check,
  Award,
} from 'lucide-react';

export default function ClientProjectProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevant');
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [existingReviews, setExistingReviews] = useState<any[]>([]);

  const fetchProjectAndProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await authService.getMe();
      if (!userRes.success || userRes.data?.role !== 'CLIENT') {
        router.push('/login');
        return;
      }

      const [projRes, propRes, revRes] = await Promise.all([
        projectService.getProjectById(projectId),
        proposalService.getProjectProposals(projectId),
        reviewService.getProjectReviews(projectId),
      ]);

      if (projRes.success && projRes.data) {
        setProject(projRes.data);
      } else {
        setError(projRes.message || 'Project not found');
      }

      if (propRes.success && propRes.data) {
        setProposals(propRes.data);
      } else {
        setError(propRes.message || 'Failed to fetch proposals');
      }

      if (revRes.success && revRes.data) {
        setExistingReviews(revRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading project proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectAndProposals();
    }
  }, [projectId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please write your feedback comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await reviewService.createReview({
        projectId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res.success) {
        setShowReviewModal(false);
        setReviewComment('');
        await fetchProjectAndProposals();
      } else {
        setReviewError(res.message || 'Failed to submit review');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStatusUpdate = async (proposalId: string, newStatus: ProposalStatus) => {
    if (
      newStatus === 'ACCEPTED' &&
      !confirm(
        'Are you sure you want to ACCEPT this proposal? This will mark your project as IN_PROGRESS and automatically reject any other pending proposals.'
      )
    ) {
      return;
    }

    setActionLoading(proposalId);
    try {
      const res = await proposalService.updateProposalStatus(proposalId, newStatus);
      if (res.success) {
        await fetchProjectAndProposals();
      } else {
        alert(res.message || 'Failed to update proposal status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = async (freelancerUserId: string) => {
    try {
      const res = await chatService.createConversation({
        projectId,
        otherUserId: freelancerUserId,
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
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={36} className="text-pink" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
        <p style={{ fontSize: '1.1rem' }}>Loading candidate proposals & hiring command center...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/client/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px', fontWeight: '600' }}>
          <ArrowLeft size={18} /> Back to Projects
        </Link>
        <div className="badge badge-error" style={{ width: '100%', padding: '20px', justifyContent: 'center', fontSize: '0.95rem' }}>
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  const isHired = project.status === 'IN_PROGRESS' || project.status === 'COMPLETED';

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/client/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: '600',
            }}
          >
            <ArrowLeft size={16} /> Projects
          </Link>
        </div>

        {/* Editorial Heading (Reference Image 5) */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            className="editorial-title"
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              color: 'var(--text-main)',
              marginBottom: '18px',
            }}
          >
            Hiring for <span style={{ color: 'var(--text-main)' }}>{project.title}</span>
          </h1>

          {/* Stepper Pipeline: Open -> Reviewing -> Hired */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-aqua)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-aqua)' }}>
                Open
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Accepting proposals</span>
            </div>

            <div style={{ color: 'var(--border-color)' }}>—</div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent-lavender-subtle)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border-highlight)',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-violet)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-lavender)' }}>
                Reviewing
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Evaluate and shortlist</span>
            </div>

            <div style={{ color: 'var(--border-color)' }}>—</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isHired ? 'var(--accent-success)' : 'var(--text-dim)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: isHired ? 'var(--accent-success)' : 'var(--text-dim)' }}>
                Hired
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Select a freelancer</span>
            </div>
          </div>
        </div>

        {/* ================= 2-COLUMN MAIN CONTENT (Reference Image 5) ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(340px, 0.85fr)',
            gap: '36px',
            alignItems: 'start',
          }}
          className="proposals-review-grid"
        >
          {/* ================= LEFT: PROPOSALS LIST ================= */}
          <div>
            {/* Header: Proposals Received & Sort By */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {proposals.length} Proposals received
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                  }}
                >
                  <option value="relevant">Most relevant</option>
                  <option value="lowest">Lowest bid</option>
                  <option value="fastest">Fastest delivery</option>
                </select>
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px' }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                  No candidate proposals received yet
                </h3>
                <p>When freelancers discover your project and submit bids, candidate evaluation cards will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {proposals.map((proposal, idx) => {
                  const freelancer = proposal.freelancer;
                  const fUser = freelancer?.user;
                  const isShortlisted = proposal.status === 'SHORTLISTED';
                  const isAccepted = proposal.status === 'ACCEPTED';
                  const isRejected = proposal.status === 'REJECTED';
                  const canChat = isShortlisted || isAccepted;
                  const isExpanded = expandedProposal === proposal.id;

                  return (
                    <div
                      key={proposal.id}
                      className="glass-panel glass-panel-interactive"
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        border: isAccepted
                          ? '1.5px solid var(--accent-success)'
                          : isShortlisted
                          ? '1.5px solid var(--border-pink)'
                          : '1px solid var(--border-color)',
                        background: 'var(--bg-panel)',
                      }}
                    >
                      {/* Candidate Top Line: Rank, Avatar, Name, Rating, Financials & Action Buttons */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto auto 1fr auto auto auto',
                          gap: '16px',
                          alignItems: 'center',
                        }}
                        className="candidate-row"
                      >
                        {/* Rank Number */}
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dim)', width: '20px' }}>
                          {idx + 1}
                        </span>

                        {/* Candidate Avatar */}
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #25D9D2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontWeight: '800',
                            fontSize: '1.2rem',
                          }}
                        >
                          {fUser?.fullName ? fUser.fullName.charAt(0).toUpperCase() : 'F'}
                        </div>

                        {/* Name & Skills */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                              {fUser?.fullName || 'Candidate'}
                            </span>
                            <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--accent-pink)', marginBottom: '8px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Star size={12} fill="var(--accent-pink)" /> 4.9
                            </span>
                            <span style={{ color: 'var(--text-dim)' }}>(128 reviews)</span>
                          </div>

                          {/* Skill Pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {freelancer?.skills?.slice(0, 4).map((s: any) => (
                              <span
                                key={s.skill.name}
                                style={{
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {s.skill.name}
                              </span>
                            ))}
                            {freelancer?.skills?.length > 4 && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                                +{freelancer.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Financials: Bid */}
                        <div style={{ textAlign: 'right', padding: '0 8px' }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block' }}>BID</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>
                            ${proposal.proposedPrice?.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Fixed price</span>
                        </div>

                        {/* Delivery */}
                        <div style={{ textAlign: 'right', padding: '0 8px' }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block' }}>DELIVERY</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>
                            {proposal.estimatedDays} days
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Est. turnaround</span>
                        </div>

                        {/* Action Buttons: Review & Shortlist */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                          {canChat ? (
                            <button
                              onClick={() => handleStartChat(fUser?.id)}
                              className="btn-primary"
                              style={{
                                padding: '7px 14px',
                                fontSize: '0.82rem',
                                justifyContent: 'center',
                                borderRadius: '8px',
                              }}
                            >
                              <MessageSquare size={14} /> Chat
                            </button>
                          ) : (
                            <button
                              onClick={() => setExpandedProposal(isExpanded ? null : proposal.id)}
                              className="btn-secondary"
                              style={{
                                padding: '7px 14px',
                                fontSize: '0.82rem',
                                justifyContent: 'center',
                                borderRadius: '8px',
                              }}
                            >
                              {isExpanded ? 'Hide pitch' : 'Review'}
                            </button>
                          )}

                          {!isAccepted && !isShortlisted && (
                            <button
                              onClick={() => handleStatusUpdate(proposal.id, 'SHORTLISTED')}
                              disabled={actionLoading === proposal.id}
                              className="btn-outline-pink"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                justifyContent: 'center',
                                borderRadius: '8px',
                              }}
                            >
                              <Bookmark size={13} /> Shortlist
                            </button>
                          )}

                          {!isAccepted && isShortlisted && (
                            <button
                              onClick={() => handleStatusUpdate(proposal.id, 'ACCEPTED')}
                              disabled={actionLoading === proposal.id}
                              className="btn-aqua"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                justifyContent: 'center',
                                borderRadius: '8px',
                              }}
                            >
                              <Check size={13} /> Hire Talent
                            </button>
                          )}

                          {isAccepted && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span className="badge badge-success" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
                                ✓ Hired Specialist
                              </span>
                              {existingReviews.length > 0 ? (
                                <span className="badge badge-pink" style={{ fontSize: '0.72rem', justifyContent: 'center' }}>
                                  ★ Reviewed ({existingReviews[0].rating} Stars)
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowReviewModal(true)}
                                  className="btn-primary"
                                  style={{
                                    padding: '6px 10px',
                                    fontSize: '0.78rem',
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                  }}
                                >
                                  <Star size={13} /> Complete & Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Candidate Pitch Excerpt */}
                      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', fontStyle: 'italic', maxWidth: '85%' }}>
                          “{isExpanded ? proposal.coverLetter : `${proposal.coverLetter?.slice(0, 160)}...`}”
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedProposal(isExpanded ? null : proposal.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-pink)',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isExpanded ? 'View less' : 'View more'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Project Activity Timeline (Reference Image 5) */}
            <div className="glass-panel" style={{ marginTop: '32px', padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Project activity
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--accent-pink)', fontWeight: '700', cursor: 'pointer' }}>
                  View all activity &gt;
                </span>
              </div>

              {/* Horizontal Milestone Nodes */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-violet)', padding: '8px', borderRadius: '50%' }}>
                    <Edit size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>Project created</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{new Date(project.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'var(--accent-aqua-subtle)', color: 'var(--accent-aqua)', padding: '8px', borderRadius: '50%' }}>
                    <Users size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>Listing went live</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{new Date(project.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '8px', borderRadius: '50%' }}>
                    <FileText size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>{proposals.length} new proposals</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Active reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: SIDEBAR HEALTH & ACTIONS (Reference Image 5) ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Project Health Card */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} className="text-pink" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Project health
                  </h3>
                </div>
                <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                  On track
                </span>
              </div>

              {/* Stats List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                {/* Budget */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-violet)', padding: '10px', borderRadius: '12px' }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>BUDGET</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      ${project.budget?.toLocaleString()} USD
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fixed price</span>
                  </div>
                </div>

                {/* Deadline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '10px', borderRadius: '12px' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>DEADLINE</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible timeline'}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-pink)' }}>12 days left</span>
                  </div>
                </div>

                {/* Proposals */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'var(--accent-aqua-subtle)', color: 'var(--accent-aqua)', padding: '10px', borderRadius: '12px' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>PROPOSALS</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {proposals.length}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-aqua)' }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Circular Progress Meter: Profile Completion */}
              <div
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: '4px solid var(--accent-aqua)',
                    borderRightColor: 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    color: 'var(--text-main)',
                    flexShrink: 0,
                  }}
                >
                  67%
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>
                    PROFILE COMPLETION
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '2px 0 4px' }}>
                    Great start! A few more details can help you get better matches.
                  </p>
                  <Link
                    href="/profile"
                    style={{
                      color: 'var(--accent-pink)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Improve now <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Quick Actions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href="/client/projects"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    transition: 'all 180ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Edit size={16} className="text-violet" />
                    <div>
                      <div>Edit project</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '400' }}>Update details, budget or timeline</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/client/projects"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    transition: 'all 180ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <X size={16} className="text-pink" />
                    <div>
                      <div>Close listing</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '400' }}>Stop receiving new proposals</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Review & Complete Modal */}
        {showReviewModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '32px',
                borderRadius: '20px',
                background: 'var(--bg-panel)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Award size={24} className="text-pink" />
                <h2 className="editorial-title" style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
                  Complete Project &amp; Review
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                Submit verified rating and feedback for the hired specialist. This will mark the contract as completed and publish your review on their profile work history.
              </p>

              {reviewError && (
                <div className="badge badge-error" style={{ width: '100%', padding: '10px', marginBottom: '16px', justifyContent: 'center' }}>
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleSubmitReview}>
                {/* Rating Selector */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Rating Score (1 to 5 Stars) *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: reviewRating >= star ? 'var(--accent-pink-subtle)' : 'var(--bg-input)',
                          border: `1px solid ${reviewRating >= star ? 'var(--border-pink)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: reviewRating >= star ? 'var(--accent-pink)' : 'var(--text-dim)',
                        }}
                      >
                        <Star size={18} fill={reviewRating >= star ? 'var(--accent-pink)' : 'none'} />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{star}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Feedback &amp; Testimonial *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your collaboration, communication, code quality, and delivery speed..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                      lineHeight: '1.5',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="btn-secondary"
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewComment.trim()}
                    className="btn-primary"
                    style={{ padding: '10px 22px' }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review & Complete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 1040px) {
          .proposals-review-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .candidate-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
