'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService';
import {
  User,
  Briefcase,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Globe,
  Edit3,
  TrendingUp,
  Award,
  Layers,
  Code,
  Check,
  ArrowRight,
  FolderPlus,
  X,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Client form state
  const [clientForm, setClientForm] = useState({
    fullName: '',
    companyName: '',
    companyWebsite: '',
    description: '',
    location: '',
  });

  // Freelancer form state
  const [freelancerForm, setFreelancerForm] = useState({
    fullName: '',
    title: '',
    bio: '',
    hourlyRate: '',
    location: '',
    experienceYears: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Portfolio modal / form state
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portUrl, setPortUrl] = useState('');
  const [portImg, setPortImg] = useState('');
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await profileService.getMyProfile();
      if (res.success && res.data) {
        const data = res.data;
        setProfile(data);

        if (data.role === 'CLIENT' && data.clientProfile) {
          setClientForm({
            fullName: data.fullName || '',
            companyName: data.clientProfile.companyName || '',
            companyWebsite: data.clientProfile.companyWebsite || '',
            description: data.clientProfile.description || '',
            location: data.clientProfile.location || '',
          });
        } else if (data.role === 'FREELANCER' && data.freelancerProfile) {
          setFreelancerForm({
            fullName: data.fullName || '',
            title: data.freelancerProfile.title || '',
            bio: data.freelancerProfile.bio || '',
            hourlyRate: data.freelancerProfile.hourlyRate ? data.freelancerProfile.hourlyRate.toString() : '',
            location: data.freelancerProfile.location || '',
            experienceYears: data.freelancerProfile.experienceYears ? data.freelancerProfile.experienceYears.toString() : '0',
          });

          if (data.freelancerProfile.skills && data.freelancerProfile.skills.length > 0) {
            setSkills(data.freelancerProfile.skills.map((s: any) => s.skill.name));
          } else {
            setSkills([]);
          }

          if (data.freelancerProfile.portfolioProjects) {
            setPortfolioItems(data.freelancerProfile.portfolioProjects);
          }
        }
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setErrorMsg('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await profileService.updateClientProfile({
        fullName: clientForm.fullName,
        companyName: clientForm.companyName,
        companyWebsite: clientForm.companyWebsite,
        description: clientForm.description,
        location: clientForm.location,
      });

      if (res.success) {
        setSuccessMsg('Client profile updated successfully!');
        setEditMode(false);
        fetchProfile();
      } else {
        setErrorMsg(res.message || 'Update failed');
      }
    } catch (err: any) {
      setErrorMsg('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await profileService.updateFreelancerProfile({
        fullName: freelancerForm.fullName,
        title: freelancerForm.title,
        bio: freelancerForm.bio,
        hourlyRate: freelancerForm.hourlyRate ? parseFloat(freelancerForm.hourlyRate) : undefined,
        location: freelancerForm.location,
        experienceYears: freelancerForm.experienceYears ? parseInt(freelancerForm.experienceYears, 10) : undefined,
        skills,
      });

      if (res.success) {
        setSuccessMsg('Freelancer profile updated successfully!');
        setEditMode(false);
        fetchProfile();
      } else {
        setErrorMsg(res.message || 'Update failed');
      }
    } catch (err: any) {
      setErrorMsg('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portDesc.trim()) return;

    setAddingPortfolio(true);
    setErrorMsg(null);

    try {
      const res = await profileService.addPortfolioItem({
        title: portTitle.trim(),
        description: portDesc.trim(),
        projectUrl: portUrl.trim() || undefined,
        imageUrl: portImg.trim() || undefined,
      });

      if (res.success && res.data) {
        setPortfolioItems([res.data, ...portfolioItems]);
        setPortTitle('');
        setPortDesc('');
        setPortUrl('');
        setPortImg('');
        setShowAddPortfolioModal(false);
        setSuccessMsg('Project card generated and added to your portfolio!');
      } else {
        setErrorMsg(res.message || 'Failed to add portfolio project');
      }
    } catch (err: any) {
      setErrorMsg('Error adding portfolio project');
    } finally {
      setAddingPortfolio(false);
    }
  };

  const handleDeletePortfolio = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this project from your portfolio?')) return;
    try {
      const res = await profileService.deletePortfolioItem(itemId);
      if (res.success) {
        setPortfolioItems(portfolioItems.filter((item) => item.id !== itemId));
        setSuccessMsg('Portfolio project removed');
      } else {
        setErrorMsg(res.message || 'Failed to delete item');
      }
    } catch (err: any) {
      setErrorMsg('Error deleting portfolio item');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
        <p style={{ fontSize: '1.1rem' }}>Loading verified specialist portfolio...</p>
      </div>
    );
  }

  const isClient = profile?.role === 'CLIENT';
  const reviewsReceived = profile?.reviewsReceived || [];
  const completedContracts = profile?.freelancerProfile?.proposals || [];

  // Compute actual dynamic average rating
  const totalReviews = reviewsReceived.length;
  const avgRating = totalReviews > 0
    ? (reviewsReceived.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : null;

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: 'clamp(20px, 4vw, 36px) clamp(12px, 3.5vw, 24px) 80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-violet" style={{ fontSize: '0.75rem', padding: '3px 10px', marginBottom: '8px' }}>
              <Sparkles size={12} /> {isClient ? 'Client Organization Profile' : 'Verified Talent Portfolio'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {!isClient && (
              <button
                onClick={() => setShowAddPortfolioModal(true)}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                <Plus size={16} /> Add Deployed Project
              </button>
            )}

            <button
              onClick={() => setEditMode(!editMode)}
              className="btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <Edit3 size={15} /> {editMode ? 'View Public Showcase' : 'Edit Profile & Skills'}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="badge badge-success" style={{ width: '100%', padding: '14px', marginBottom: '24px', justifyContent: 'center', fontSize: '0.95rem', borderRadius: '10px' }}>
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="badge badge-error" style={{ width: '100%', padding: '14px', marginBottom: '24px', justifyContent: 'center', fontSize: '0.95rem', borderRadius: '10px' }}>
            ✕ {errorMsg}
          </div>
        )}

        {/* ================= EDIT MODE ================= */}
        {editMode ? (
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px', marginBottom: '40px' }}>
            <h2 className="editorial-title" style={{ fontSize: '1.8rem', marginBottom: '24px', color: 'var(--text-main)' }}>
              Edit {isClient ? 'Company Profile' : 'Specialist Profile & Skills'}
            </h2>

            {isClient ? (
              <form onSubmit={handleSaveClient}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Full Name *</label>
                    <input
                      type="text"
                      value={clientForm.fullName}
                      onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Company Name</label>
                    <input
                      type="text"
                      value={clientForm.companyName}
                      onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Company Website</label>
                    <input
                      type="url"
                      placeholder="https://company.com"
                      value={clientForm.companyWebsite}
                      onChange={(e) => setClientForm({ ...clientForm, companyWebsite: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA / Remote"
                      value={clientForm.location}
                      onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Company Bio</label>
                  <textarea
                    rows={4}
                    value={clientForm.description}
                    onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 24px' }}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Company Details'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveFreelancer}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Full Name *</label>
                    <input
                      type="text"
                      value={freelancerForm.fullName}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, fullName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Professional Title (e.g. Full-Stack Developer, UI/UX Designer) *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={freelancerForm.title}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, title: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Hourly Rate ($ USD / hr)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={freelancerForm.hourlyRate}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, hourlyRate: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Location & Timezone</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India | UTC +5:30"
                      value={freelancerForm.location}
                      onChange={(e) => setFreelancerForm({ ...freelancerForm, location: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Professional Bio *</label>
                  <textarea
                    rows={4}
                    placeholder="Introduce your engineering experience, tools, and what makes your solutions stand out..."
                    value={freelancerForm.bio}
                    onChange={(e) => setFreelancerForm({ ...freelancerForm, bio: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Skills Manager */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Skills & Technologies</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Type a skill and click Add (e.g. React, Next.js, Node.js)..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                      style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                    <button type="button" onClick={handleAddSkill} className="btn-secondary" style={{ padding: '10px 16px' }}>Add</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((s) => (
                      <span key={s} className="badge badge-neutral" style={{ padding: '6px 14px', fontSize: '0.85rem', gap: '6px' }}>
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} style={{ background: 'none', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No skills added yet. Type your top tech skills above!</span>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 24px' }}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            )}
          </div>
        ) : null}

        {/* ================= FREELANCER PUBLIC PROFILE SHOWCASE ================= */}
        {!isClient ? (
          <div>
            {/* Hero Profile Header (Dynamic for current user) */}
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                borderRadius: '20px',
                marginBottom: '36px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '32px',
                flexWrap: 'wrap',
              }}
            >
              {/* Large Glowing Avatar with Constellation Ring */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #25D9D2 50%, #F48AC2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '2.8rem',
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
                    border: '3px solid var(--border-color)',
                  }}
                >
                  {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--accent-pink)',
                    border: '2px solid var(--bg-panel)',
                  }}
                />
              </div>

              {/* Profile Details */}
              <div style={{ flex: '1 1 480px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h1 className="editorial-title" style={{ fontSize: '2.4rem', color: 'var(--text-main)' }}>
                    {profile.fullName}
                  </h1>
                </div>

                <div style={{ fontSize: '1.2rem', color: 'var(--accent-violet)', fontWeight: '700', marginBottom: '14px' }}>
                  {freelancerForm.title || (
                    <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontWeight: '400' }}>
                      Add your professional title (e.g. Full-Stack Developer)
                    </span>
                  )}
                </div>

                {/* Status Badges Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span className="badge badge-aqua" style={{ padding: '5px 12px', fontSize: '0.82rem' }}>
                    ● Available for work
                  </span>
                  <span className="badge badge-aqua" style={{ padding: '5px 12px', fontSize: '0.82rem' }}>
                    <CheckCircle2 size={13} /> Verified
                  </span>
                  {freelancerForm.hourlyRate && (
                    <span className="badge badge-pink" style={{ padding: '5px 12px', fontSize: '0.82rem' }}>
                      ${freelancerForm.hourlyRate}/hr
                    </span>
                  )}
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} className="text-aqua" /> {freelancerForm.location || 'Global / Remote'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.7', maxWidth: '720px' }}>
                  {freelancerForm.bio || (
                    <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      Introduce yourself and your experience by clicking &ldquo;Edit Profile &amp; Skills&rdquo; above.
                    </span>
                  )}
                </p>
              </div>

              {/* Dynamic Star Rating Box based on actual reviews */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                  <Star size={24} fill="var(--accent-pink)" /> {avgRating ? avgRating : '5.0'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  {totalReviews > 0 ? `${totalReviews} client review${totalReviews > 1 ? 's' : ''}` : 'New Talent (0 reviews)'}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                Skills & Technologies
              </h2>
              {skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '7px 16px',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem' }}>
                  No skills listed yet. Click &ldquo;Edit Profile &amp; Skills&rdquo; to add your technical stack.
                </p>
              )}
            </div>

            {/* ================= DYNAMIC PORTFOLIO SHOWCASE ================= */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Portfolio & Deployed Projects ({portfolioItems.length})
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Showcase your live deployed web applications, case studies, and code repositories
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPortfolioModal(true)}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={15} /> Add Project Card
                </button>
              </div>

              {portfolioItems.length === 0 ? (
                /* Dynamic Empty Portfolio State */
                <div
                  className="glass-panel"
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    borderRadius: '18px',
                    border: '1.5px dashed var(--border-color)',
                    background: 'var(--bg-panel)',
                  }}
                >
                  <FolderPlus size={44} className="text-aqua" style={{ marginBottom: '14px', opacity: 0.8 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                    No deployed projects added yet
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                    Generate your project showcase card! Add your live deployed website URL (Vercel, Netlify, AWS, etc.) or GitHub link to impress hiring clients.
                  </p>
                  <button
                    onClick={() => setShowAddPortfolioModal(true)}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: '0.92rem' }}
                  >
                    <Plus size={16} /> Generate Your First Project Card
                  </button>
                </div>
              ) : (
                /* Dynamic Grid of User's Portfolio Projects */
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                    gap: '20px',
                  }}
                >
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="glass-panel glass-panel-interactive"
                      style={{
                        padding: '24px',
                        borderRadius: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: 'var(--bg-panel)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-violet)', padding: '8px', borderRadius: '10px' }}>
                              <TrendingUp size={20} />
                            </div>
                            <h3 className="editorial-title" style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>
                              {item.title}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleDeletePortfolio(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Remove project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                          {item.description}
                        </p>

                        {/* Project Visual Mockup Tile */}
                        <div
                          style={{
                            height: '140px',
                            borderRadius: '12px',
                            background: item.imageUrl
                              ? `url(${item.imageUrl}) center/cover no-repeat`
                              : 'linear-gradient(135deg, #1C1026 0%, #2D1B3A 100%)',
                            border: '1px solid var(--border-color)',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {!item.imageUrl && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                                <Globe size={24} />
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Live Deployed Application</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Deployed Link Action */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.projectUrl ? (
                          <a
                            href={item.projectUrl.startsWith('http') ? item.projectUrl : `https://${item.projectUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'var(--accent-pink)',
                              fontSize: '0.9rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>Open Deployed Project</span> <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Portfolio Showcase</span>
                        )}

                        <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ================= DYNAMIC WORK HISTORY & FEEDBACK ================= */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Work History & Client Feedback ({reviewsReceived.length})
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Verified client reviews given upon project completion
                  </p>
                </div>
              </div>

              {reviewsReceived.length === 0 ? (
                /* Dynamic Empty Review State */
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                  <Star size={36} className="text-pink" style={{ marginBottom: '10px', opacity: 0.4 }} />
                  <p style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>No client reviews yet</p>
                  <p style={{ fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                    When clients accept your proposals and complete project milestones, verified 5-star ratings and client testimonials will automatically appear in your work history timeline.
                  </p>
                </div>
              ) : (
                /* Dynamic Reviews List from Real DB */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                  {reviewsReceived.map((rev: any, idx: number) => {
                    const isLast = idx === reviewsReceived.length - 1;

                    return (
                      <div key={rev.id} style={{ display: 'flex', gap: '18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-pink)', marginTop: '4px' }} />
                          {!isLast && <div style={{ width: '2px', flex: 1, background: 'var(--border-color)', margin: '6px 0' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                              {rev.project?.title || 'Completed Project Contract'}
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Client: <strong style={{ color: 'var(--text-main)' }}>{rev.reviewer?.fullName || 'Verified Client'}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '2px', color: 'var(--accent-pink)' }}>
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} size={14} fill="var(--accent-pink)" />
                              ))}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                              &ldquo;{rev.comment}&rdquo;
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= CLIENT PROFILE VIEW ================= */
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F48AC2 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '2rem',
                }}
              >
                {clientForm.fullName ? clientForm.fullName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h1 className="editorial-title" style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {clientForm.fullName}
                </h1>
                <div style={{ color: 'var(--accent-pink)', fontWeight: '700', fontSize: '1rem' }}>
                  {clientForm.companyName ? `${clientForm.companyName}` : 'Hiring Client Organization'}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '24px' }}>
              {clientForm.description || 'Welcome to our organization profile on WorkSphere. We hire top specialized software engineers and designers for impactful projects.'}
            </p>

            <div style={{ display: 'flex', gap: '20px', color: 'var(--text-dim)', fontSize: '0.92rem' }}>
              {clientForm.location && <span>📍 {clientForm.location}</span>}
              {clientForm.companyWebsite && (
                <a href={clientForm.companyWebsite.startsWith('http') ? clientForm.companyWebsite : `https://${clientForm.companyWebsite}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-aqua)', textDecoration: 'none' }}>
                  🌐 {clientForm.companyWebsite}
                </a>
              )}
            </div>
          </div>
        )}

        {/* ================= ADD PORTFOLIO PROJECT MODAL ================= */}
        {showAddPortfolioModal && (
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
                maxWidth: '560px',
                padding: 'clamp(20px, 5vw, 32px)',
                borderRadius: '20px',
                background: 'var(--bg-panel)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <button
                onClick={() => setShowAddPortfolioModal(false)}
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
                <FolderPlus size={22} className="text-aqua" />
                <h2 className="editorial-title" style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
                  Add Deployed Project
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                Create a live project card with your deployed app link to showcase on your profile.
              </p>

              <form onSubmit={handleAddPortfolio}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Project Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI Content Studio / FinTech Dashboard"
                    value={portTitle}
                    onChange={(e) => setPortTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Live Deployed Link (Vercel, Netlify, GitHub, or URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://my-app.vercel.app"
                    value={portUrl}
                    onChange={(e) => setPortUrl(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Project Description *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what the application does, technologies used, and key features..."
                    value={portDesc}
                    onChange={(e) => setPortDesc(e.target.value)}
                    required
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Thumbnail Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... (optional)"
                    value={portImg}
                    onChange={(e) => setPortImg(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddPortfolioModal(false)}
                    className="btn-secondary"
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingPortfolio || !portTitle.trim() || !portDesc.trim()}
                    className="btn-primary"
                    style={{ padding: '10px 22px' }}
                  >
                    {addingPortfolio ? 'Adding...' : 'Publish Project Card'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
