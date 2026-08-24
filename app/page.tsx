'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService, ApiResponse } from '../services/api';
import {
  Search,
  Briefcase,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  Terminal,
  Activity,
  Award,
  Layers,
  Star,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [healthState, setHealthState] = useState<{
    loading: boolean;
    data: any | null;
    error: string | null;
  }>({
    loading: true,
    data: null,
    error: null,
  });

  const fetchBackendHealth = async () => {
    setHealthState((prev) => ({ ...prev, loading: true, error: null }));
    const res: ApiResponse = await apiService.checkHealth();
    if (res.success) {
      setHealthState({ loading: false, data: res.data, error: null });
    } else {
      setHealthState({ loading: false, data: null, error: res.message || 'Server Offline' });
    }
  };

  useEffect(() => {
    fetchBackendHealth();
  }, []);

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '0 0 100px', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(14px, 3.5vw, 24px) 0' }}>
        
        {/* ================= HERO SECTION (Reference Image 2) ================= */}
        <section
          className="landing-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            alignItems: 'center',
            gap: '40px',
            padding: '20px 0 50px',
            position: 'relative',
          }}
        >
          {/* Hero Left: Editorial Copy & CTAs */}
          <div style={{ width: '100%', maxWidth: '580px' }}>
            <h1
              className="editorial-title"
              style={{
                fontSize: 'clamp(2.2rem, 5.5vw, 4.4rem)',
                color: 'var(--text-main)',
                marginBottom: '20px',
              }}
            >
              Work moves{' '}
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: '400',
                  color: 'var(--accent-pink)',
                  display: 'inline-block',
                }}
              >
                better
              </span>{' '}
              when people connect.
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(1rem, 1.8vw, 1.22rem)',
                lineHeight: '1.65',
                marginBottom: '32px',
                maxWidth: '500px',
              }}
            >
              WorkSphere is the freelance marketplace where great projects meet the right talent.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link
                href="/projects"
                className="btn-primary"
                style={{ padding: '13px 26px', fontSize: '0.98rem' }}
              >
                Explore projects <ArrowRight size={17} />
              </Link>
              <Link
                href="/freelancers"
                className="btn-secondary"
                style={{ padding: '12px 24px', fontSize: '0.98rem' }}
              >
                <Users size={17} className="text-aqua" /> Find talent
              </Link>
            </div>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  window.location.href = `/projects?search=${encodeURIComponent(searchTerm.trim())}`;
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '6px 8px 6px 14px',
                maxWidth: '480px',
                width: '100%',
                gap: '8px',
              }}
            >
              <Search size={18} className="text-aqua" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search skills, projects (e.g. React)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxShadow: 'none',
                  padding: '6px 0',
                }}
              />
              <button
                type="submit"
                className="btn-aqua"
                style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Hero Right: Floating Layered Editorial Collage */}
          <div
            className="hero-collage-container"
            style={{
              position: 'relative',
              minHeight: '440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            {/* Ambient Constellation Network Lines SVG */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
              viewBox="0 0 540 440"
              fill="none"
            >
              <path
                d="M80 120 C 180 80, 320 60, 480 150"
                stroke="rgba(124, 58, 237, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M120 380 C 260 300, 380 340, 500 240"
                stroke="rgba(37, 217, 210, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M240 70 L 370 200 L 460 330"
                stroke="rgba(244, 138, 194, 0.25)"
                strokeWidth="1.2"
              />
              <circle cx="240" cy="70" r="4" fill="#F48AC2" />
              <circle cx="370" cy="200" r="5" fill="#7C3AED" />
              <circle cx="480" cy="150" r="7" fill="#25D9D2" opacity="0.8" />
              <circle cx="460" cy="330" r="6" fill="#F48AC2" opacity="0.85" />
            </svg>

            {/* Collage Card 1: Brand Identity for Solstice */}
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '10px',
                left: '40px',
                width: '240px',
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--bg-panel)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 3,
                transform: 'rotate(-4deg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-pink" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  Branding
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Identity</span>
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>
                Brand Identity for Solstice
              </div>

              {/* Artwork Graphic Preview */}
              <div
                style={{
                  height: '90px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2D1B3A 0%, #160D1E 100%)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FAF7FC 50%, #F48AC2 50%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                />
              </div>

              {/* Avatar Stack */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', marginLeft: '6px' }}>
                  {['#7C3AED', '#25D9D2', '#F48AC2'].map((col, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: col,
                        border: '2px solid var(--bg-panel)',
                        marginLeft: '-6px',
                      }}
                    />
                  ))}
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--bg-surface-elevated)',
                      border: '2px solid var(--bg-panel)',
                      marginLeft: '-6px',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-main)',
                    }}
                  >
                    +2
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-pink)', fontWeight: '700' }}>
                  Illustrator
                </span>
              </div>
            </div>

            {/* Collage Card 2: Mobile App Redesign */}
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '50px',
                right: '20px',
                width: '220px',
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--bg-panel)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 2,
                transform: 'rotate(5deg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-aqua" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  UI/UX
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-aqua)', fontWeight: '700' }}>Designer</span>
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                Mobile App Redesign
              </div>

              {/* Wireframe Mockup Preview */}
              <div
                style={{
                  height: '95px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ width: '40%', height: '8px', borderRadius: '4px', background: 'var(--border-highlight)' }} />
                <div style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--accent-aqua-subtle)' }} />
                </div>
                <div style={{ width: '70%', height: '6px', borderRadius: '3px', background: 'var(--border-subtle)' }} />
              </div>
            </div>

            {/* Paper Cutout Tag 3: Editorial Layout */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '20px',
                padding: '12px 18px',
                borderRadius: '12px',
                background: '#FAF7FC',
                color: '#160D1E',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                zIndex: 4,
                transform: 'rotate(-2deg)',
                maxWidth: '180px',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7C3AED' }}>
                Editorial Layout
              </div>
              <div className="font-serif" style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '2px', lineHeight: 1.1 }}>
                Design <span style={{ fontSize: '1.4rem' }}>R</span>
              </div>
            </div>

            {/* Paper Note 4: Great work happens together */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '40px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: '#F6EFE9',
                color: '#22122E',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                zIndex: 4,
                transform: 'rotate(3deg)',
              }}
            >
              <div className="font-serif" style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                Great work <br />
                <span className="font-hand" style={{ fontSize: '1.3rem', color: '#D94688' }}>
                  happens together.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TRUST BADGES BAR ================= */}
        <section
          style={{
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '24px 0',
            margin: '20px 0 60px',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-dim)',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            TRUSTED BY THOUSANDS OF TEAMS AND FOUNDERS
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent-aqua-subtle)', color: 'var(--accent-aqua)', padding: '10px', borderRadius: '10px' }}>
                <ShieldCheck size={20} />
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Secure payments and protection
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent-lavender-subtle)', color: 'var(--accent-lavender)', padding: '10px', borderRadius: '10px' }}>
                <Award size={20} />
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Top talent on every skill
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '10px', borderRadius: '10px' }}>
                <MessageSquare size={20} />
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Clear communication from start to finish
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent-success-subtle)', color: 'var(--accent-success)', padding: '10px', borderRadius: '10px' }}>
                <Clock size={20} />
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)' }}>
                On-time delivery, every time
              </span>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES & FEATURED SHOWCASE (Reference Image 2) ================= */}
        <section style={{ marginBottom: '64px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Left 4 Category Cards Grid (2x2 Balanced) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}
              className="categories-2x2-grid"
            >
              {/* Category 1: Design & Creative */}
              <Link
                href="/projects?skill=Design"
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                    Design & Creative
                  </h3>
                  {/* Decorative Icon Collage */}
                  <div
                    style={{
                      height: '70px',
                      background: 'var(--bg-input)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <div className="font-serif" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                      A
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    Branding, UI/UX, Illustration, Motion and more
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-violet)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>

              {/* Category 2: Development & Tech */}
              <Link
                href="/projects?skill=React"
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                    Development & Tech
                  </h3>
                  <div
                    style={{
                      height: '70px',
                      background: 'var(--bg-input)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-aqua)' }}>
                      &lt;/&gt;
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    Web, Mobile, AI, DevOps and more
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-pink)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>

              {/* Category 3: Writing & Content */}
              <Link
                href="/projects?skill=Content"
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                    Writing & Content
                  </h3>
                  <div
                    style={{
                      height: '70px',
                      background: 'var(--bg-input)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem', color: 'var(--accent-lavender)' }}>“„</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    Copywriting, Articles, Editing and more
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-lavender)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>

              {/* Category 4: AI & Data Science (Balanced 4th Card) */}
              <Link
                href="/projects?skill=AI"
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                    AI & Data Science
                  </h3>
                  <div
                    style={{
                      height: '70px',
                      background: 'var(--bg-input)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-aqua)' }}>
                      AI ✦
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    LLMs, Custom AI Agents, Data Analytics & ML
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-aqua)',
                      color: '#160D1E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </div>

            {/* Featured Project Showcase Card (Reference Image 2) */}
            <div
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '28px',
                borderRadius: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--accent-pink)',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  FEATURED PROJECT
                </span>
                <h3 className="editorial-title" style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--text-main)' }}>
                  Brand identity for Solstice Studio
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Branding</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Logo Design</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Art Direction</span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Solstice Studio is a wellness brand focused on balance and mindful living.
                </p>

                <div style={{ display: 'flex', gap: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block' }}>BUDGET</span>
                    <strong style={{ color: 'var(--text-main)' }}>$2,500</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block' }}>DURATION</span>
                    <strong style={{ color: 'var(--text-main)' }}>3-4 weeks</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block' }}>5 PROPOSALS</span>
                    <div style={{ display: 'flex', marginTop: '2px' }}>
                      {['#7C3AED', '#25D9D2', '#F48AC2'].map((c, i) => (
                        <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, marginLeft: i > 0 ? '-4px' : 0 }} />
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href="/projects"
                  style={{
                    color: 'var(--accent-pink)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  View project <ArrowRight size={14} />
                </Link>
              </div>

              {/* Artwork Graphic Frame */}
              <div
                style={{
                  height: '180px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1C1026 0%, #2D1B3A 100%)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FAF7FC 50%, #F48AC2 50%)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            </div>

            {/* Top Talent Showcase Card (Reference Image 2) */}
            <div
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '28px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--accent-aqua)',
                    display: 'block',
                    marginBottom: '14px',
                  }}
                >
                  TOP TALENT
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #25D9D2 0%, #7C3AED 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: '800',
                      fontSize: '1.2rem',
                    }}
                  >
                    M
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>Mira Chen</h4>
                      <CheckCircle2 size={16} className="text-aqua" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brand Designer & Art Director</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Branding</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Identity</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Art Direction</span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  I help thoughtful brands tell stories that connect and last.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--accent-pink)', fontWeight: '700', marginBottom: '16px' }}>
                  <Star size={16} fill="var(--accent-pink)" /> 5.0 <span style={{ color: 'var(--text-dim)', fontWeight: '400' }}>(48 reviews)</span>
                </div>
              </div>

              <Link
                href="/freelancers"
                style={{
                  color: 'var(--accent-aqua)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                View profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= ARCHITECTURE & FEATURES GRID ================= */}
        <section style={{ margin: '40px 0 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-violet" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} /> Production Full-Stack Marketplace
            </span>
            <h2 className="editorial-title" style={{ fontSize: '2.4rem', color: 'var(--text-main)' }}>
              Engineered for Speed, Reliability & Security
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '8px auto 0' }}>
              Built with Next.js App Router, Controller-Service architecture, TypeScript, and Supabase.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Feature 1 */}
            <div className="glass-panel glass-panel-interactive" style={{ padding: '30px', borderRadius: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--accent-lavender-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Briefcase size={24} className="text-violet" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
                Project & Proposal Lifecycle
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.92rem', marginBottom: '16px' }}>
                Full state lifecycle machine (<span className="text-aqua" style={{ fontWeight: '700' }}>OPEN</span>, <span className="text-pink" style={{ fontWeight: '700' }}>IN_PROGRESS</span>, <span className="text-success" style={{ fontWeight: '700' }}>COMPLETED</span>), server-side pagination, and dynamic skill tag matching.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral">Pagination</span>
                <span className="badge badge-aqua">State Machine</span>
                <span className="badge badge-violet">Skill Matching</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel glass-panel-interactive" style={{ padding: '30px', borderRadius: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--accent-pink-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <ShieldCheck size={24} className="text-pink" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
                JWT & Role-Based Auth
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.92rem', marginBottom: '16px' }}>
                <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-pink)' }}>bcrypt</code> hashing, atomic <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-pink)' }}>$transaction</code> profile creation, and role guards (<span className="text-pink" style={{ fontWeight: '700' }}>CLIENT</span> & <span className="text-aqua" style={{ fontWeight: '700' }}>FREELANCER</span>).
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-pink">Atomic $transaction</span>
                <span className="badge badge-neutral">Role Guard</span>
                <span className="badge badge-success">JWT HttpOnly</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel glass-panel-interactive" style={{ padding: '30px', borderRadius: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--accent-aqua-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Layers size={24} className="text-aqua" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
                Relational Supabase Schema
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.92rem', marginBottom: '16px' }}>
                Full relational integrity with foreign keys, cascade deletes, and indexing across all marketplace entities.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-aqua">PostgreSQL</span>
                <span className="badge badge-violet">Supabase</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= LIVE BACKEND API HEALTH MONITOR ================= */}
        <section
          className="glass-panel"
          style={{
            padding: 'clamp(20px, 4vw, 36px)',
            borderRadius: '18px',
            background: 'var(--bg-panel)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Terminal size={20} className="text-aqua" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Live API Gateway Status
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Real-time verification of App Router API Endpoint (<code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-aqua)' }}>/api/v1/health</code>)
              </p>
            </div>
            <button
              onClick={fetchBackendHealth}
              className="btn-aqua"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Activity size={15} /> Re-check Health
            </button>
          </div>

          {healthState.loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Pinging API health endpoint...
            </div>
          ) : healthState.error ? (
            <div className="badge badge-error" style={{ width: '100%', padding: '16px', justifyContent: 'center', fontSize: '0.95rem' }}>
              🔴 Backend Offline: {healthState.error}
            </div>
          ) : (
            <div
              style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-success">🟢 Next.js Server Operational</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                    Environment: <strong>{healthState.data?.environment || 'development'}</strong>
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Timestamp: {healthState.data?.timestamp ? new Date(healthState.data.timestamp).toLocaleTimeString() : 'Live'}
                </span>
              </div>
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  color: 'var(--accent-lavender)',
                  lineHeight: '1.6',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(healthState.data, null, 2)}
              </pre>
            </div>
          )}
        </section>

      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .landing-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 580px) {
          .hero-collage-container {
            min-height: 380px !important;
            transform: scale(0.88);
            transform-origin: top center;
            margin-bottom: -30px !important;
          }
          .categories-2x2-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 390px) {
          .hero-collage-container {
            min-height: 340px !important;
            transform: scale(0.76);
            transform-origin: top center;
            margin-bottom: -60px !important;
          }
        }
      `}</style>
    </div>
  );
}
