'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import {
  FolderKanban,
  FileText,
  Edit3,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  X,
  Save,
  Users,
} from 'lucide-react';

export default function ClientProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState('OPEN');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchMyProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRes = await authService.getMe();
      if (!userRes.success || userRes.data?.role !== 'CLIENT') {
        router.push('/login');
        return;
      }

      const res = await projectService.getMyProjects();
      if (res.success && res.data) {
        setProjects(res.data);
      } else {
        setError(res.message || 'Failed to fetch your projects');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const openEditModal = (proj: any) => {
    setEditingProject(proj);
    setEditTitle(proj.title || '');
    setEditDesc(proj.description || '');
    setEditBudget(proj.budget?.toString() || '');
    setEditDeadline(proj.deadline ? proj.deadline.split('T')[0] : '');
    setEditStatus(proj.status || 'OPEN');
    setEditSkills(proj.skills ? proj.skills.map((s: any) => s.skill.name) : []);
    setModalError(null);
  };

  const handleAddEditSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveEditSkill = (sToRemove: string) => {
    setEditSkills(editSkills.filter((s) => s !== sToRemove));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSaving(true);
    setModalError(null);

    try {
      const res = await projectService.updateProject(editingProject.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        budget: parseFloat(editBudget),
        deadline: editDeadline ? new Date(editDeadline).toISOString() : undefined,
        status: editStatus as any,
        skills: editSkills,
      });

      if (res.success && res.data) {
        setEditingProject(null);
        fetchMyProjects();
      } else {
        setModalError(res.message || 'Failed to update project');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '36px 24px 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px', marginBottom: '8px' }}>
              <Sparkles size={12} /> Client Project Manager
            </span>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text-main)', marginBottom: '8px' }}>
              My Posted <span style={{ color: 'var(--accent-pink)' }}>Projects</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Manage active listings, review candidate proposals, and update project specifications.
            </p>
          </div>

          <Link href="/projects/create" className="btn-primary" style={{ padding: '12px 22px' }}>
            <Plus size={18} /> Post New Project
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} className="text-pink" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
            <p style={{ fontSize: '1.1rem' }}>Loading your project listings...</p>
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ width: '100%', padding: '18px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px' }}>
            <FolderKanban size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>No projects posted yet</h3>
            <p style={{ marginBottom: '24px' }}>Create your first project brief and start receiving bids from top freelancers.</p>
            <Link href="/projects/create" className="btn-primary" style={{ padding: '12px 24px' }}>
              + Post First Project
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {projects.map((proj) => {
              const proposalCount = proj._count?.proposals || proj.proposals?.length || 0;

              return (
                <div
                  key={proj.id}
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: '28px',
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span
                          className={`badge ${
                            proj.status === 'OPEN'
                              ? 'badge-aqua'
                              : proj.status === 'IN_PROGRESS'
                              ? 'badge-pink'
                              : 'badge-neutral'
                          }`}
                          style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                        >
                          {proj.status}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                          Created on {new Date(proj.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="editorial-title" style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
                        <Link href={`/projects/${proj.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                          {proj.title}
                        </Link>
                      </h2>

                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Budget: <strong className="text-pink">${proj.budget?.toLocaleString()} USD</strong>
                        {proj.deadline && ` • Deadline: ${new Date(proj.deadline).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => openEditModal(proj)}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      >
                        <Edit3 size={15} /> Edit
                      </button>

                      <Link
                        href={`/client/projects/${proj.id}/proposals`}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                      >
                        <FileText size={15} /> Review Proposals ({proposalCount})
                      </Link>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
                    {proj.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {proj.skills?.map((item: any) => (
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
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingProject && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
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
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '32px',
                borderRadius: '20px',
                background: 'var(--bg-panel)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setEditingProject(null)}
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

              <h2 className="editorial-title" style={{ fontSize: '1.6rem', marginBottom: '20px', color: 'var(--text-main)' }}>
                Edit Project Specifications
              </h2>

              {modalError && (
                <div className="badge badge-error" style={{ width: '100%', padding: '12px', marginBottom: '18px', justifyContent: 'center' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveEdit}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Description *</label>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Budget ($ USD) *</label>
                    <input
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>Deadline (Optional)</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="btn-secondary"
                    style={{ padding: '10px 20px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Updates'}
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
