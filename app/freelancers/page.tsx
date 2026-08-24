'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { profileService } from '@/services/profileService';
import {
  Search,
  UserCheck,
  Tag,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  DollarSign,
  Users,
} from 'lucide-react';

export default function FreelancersDirectoryPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');

  const fetchFreelancers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await profileService.listFreelancers({
        search: search || undefined,
        skill: skill || undefined,
      });

      if (res.success) {
        setFreelancers(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch freelancers');
      }
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFreelancers();
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: 'clamp(20px, 4vw, 36px) clamp(12px, 3.5vw, 24px) 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px', marginBottom: '8px' }}>
            <Sparkles size={12} /> Verified Specialist Network
          </span>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', color: 'var(--text-main)', marginBottom: '8px' }}>
            Find Top <span style={{ color: 'var(--accent-pink)' }}>Freelance Talent</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Connect with verified software engineers, designers, and specialists ready for your next project.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 20px) clamp(14px, 3.5vw, 24px)', marginBottom: '32px', borderRadius: '16px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search by name, title, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Tag size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Filter by Skill (e.g. Node.js, React)..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '11px 20px', justifyContent: 'center' }}>
              Search Talent
            </button>
          </form>
        </div>

        {/* Freelancers Directory Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
            <p style={{ fontSize: '1.1rem' }}>Searching verified talent network...</p>
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ width: '100%', padding: '20px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        ) : freelancers.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px' }}>
            <UserCheck size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>No freelancers found</h3>
            <p>Try searching for a different skill tag or broader keywords.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '20px',
            }}
          >
            {freelancers.map((f) => (
              <div
                key={f.id}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: 'clamp(18px, 3.5vw, 26px)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-panel)',
                }}
              >
                <div>
                  {/* Top: Avatar, Name & Hourly Rate */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                          fontSize: '1.15rem',
                        }}
                      >
                        {f.user?.fullName?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {f.user?.fullName || 'Freelancer'}
                          </h3>
                          <CheckCircle2 size={14} className="text-aqua" />
                        </div>
                        <div style={{ color: 'var(--accent-violet)', fontSize: '0.88rem', fontWeight: '700' }}>
                          {f.title || 'Freelance Specialist'}
                        </div>
                      </div>
                    </div>

                    {f.hourlyRate && (
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                        ${f.hourlyRate}/hr
                      </span>
                    )}
                  </div>

                  {/* Location & Experience */}
                  <div style={{ display: 'flex', gap: '12px', color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {f.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={13} className="text-aqua" /> {f.location}
                      </span>
                    )}
                    {f.experienceYears > 0 && <span>• {f.experienceYears} yrs experience</span>}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-pink)' }}>
                      <Star size={12} fill="var(--accent-pink)" /> 5.0
                    </span>
                  </div>

                  {/* Bio snippet */}
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      marginBottom: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {f.bio || 'Experienced software specialist dedicated to delivering scalable applications and clean code.'}
                  </p>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {f.skills?.map((item: any) => (
                      <span
                        key={item.skill.name}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-aqua)', fontWeight: '600' }}>
                    ● Available for hire
                  </span>
                  <Link
                    href="/projects/create"
                    className="btn-primary"
                    style={{ padding: '7px 16px', fontSize: '0.85rem' }}
                  >
                    Post Job for Talent
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
