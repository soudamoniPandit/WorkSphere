'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Tag,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !budget) {
      setError('Please fill in the project title, description, and budget.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await projectService.createProject({
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        skills,
      });

      if (res.success && res.data) {
        router.push(`/projects/${res.data.id}`);
      } else {
        setError(res.message || 'Failed to create project.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '36px 24px 80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px', marginBottom: '8px' }}>
            <Sparkles size={12} /> Client Hiring Command Center
          </span>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text-main)', marginBottom: '8px' }}>
            Post a New <span style={{ color: 'var(--accent-pink)' }}>Project</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Describe your project goals, set deliverables and budget, and receive proposals from top specialists.
          </p>
        </div>

        {error && (
          <div className="badge badge-error" style={{ width: '100%', padding: '16px', marginBottom: '24px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.85fr)',
            gap: '36px',
            alignItems: 'start',
          }}
          className="post-project-grid"
        >
          {/* Main Form */}
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px', background: 'var(--bg-panel)' }}>
            <form onSubmit={handleSubmit}>
              {/* Project Title */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build a cloud kitchen website with online ordering"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                  }}
                />
              </div>

              {/* Project Description */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    Detailed Project Brief & Scope *
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {description.length} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Describe your objectives, deliverables, brand requirements, and target timeline..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Budget & Deadline Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    Budget ($ USD) *
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      fontWeight: '700',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    Target Completion Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </div>

              {/* Skills Manager */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Required Skills & Technologies
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter (e.g. Next.js, Figma, Node.js)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '11px 16px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn-secondary"
                    style={{ padding: '11px 20px' }}
                  >
                    Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="badge badge-neutral"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-pink)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  justifyContent: 'center',
                  fontSize: '1.05rem',
                  borderRadius: '12px',
                }}
              >
                {loading ? 'Publishing project listing...' : <><span>Publish Project Listing</span> <ArrowRight size={17} /></>}
              </button>
            </form>
          </div>

          {/* Sidebar Pro Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Lightbulb size={22} className="text-aqua" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Hiring Best Practices
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <CheckCircle2 size={16} className="text-aqua" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Clear Deliverables:</strong> List exact milestones like wireframes, frontend build, and API endpoints.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <CheckCircle2 size={16} className="text-pink" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Accurate Budgeting:</strong> Competitive budgets attract top-tier specialized freelancers with 5.0 ratings.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <CheckCircle2 size={16} className="text-lavender" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Shortlist & Chat:</strong> Use WorkSphere direct messaging to interview candidate pitches before hiring.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .post-project-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
