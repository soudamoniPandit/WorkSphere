'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
import {
  Briefcase,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wallet,
  Tag,
  Sparkles,
  ArrowRight,
  User,
  Clock,
} from 'lucide-react';

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 6, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [skill, setSkill] = useState<string>('');
  const [status, setStatus] = useState<string>('OPEN');
  const [page, setPage] = useState<number>(1);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getProjects({
        page,
        limit: 6,
        search: search || undefined,
        skill: skill || undefined,
        status: status || undefined,
      });

      if (res.success) {
        setProjects(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '36px 24px 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-aqua" style={{ fontSize: '0.75rem', padding: '3px 10px', marginBottom: '8px' }}>
              <Sparkles size={12} /> Marketplace Directory
            </span>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text-main)', marginBottom: '8px' }}>
              Explore <span style={{ color: 'var(--accent-pink)' }}>Projects</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Browse open client listings, filter by tech stack, and submit high-impact proposals.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '36px', borderRadius: '16px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
            {/* Keyword Search */}
            <div style={{ position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search by title or description..."
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

            {/* Skill Filter */}
            <div style={{ position: 'relative' }}>
              <Tag size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Filter by skill (e.g. React)..."
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

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="OPEN">Status: OPEN</option>
                <option value="IN_PROGRESS">Status: IN_PROGRESS</option>
                <option value="COMPLETED">Status: COMPLETED</option>
                <option value="ALL">Status: ALL</option>
              </select>
            </div>

            {/* Apply Button */}
            <button type="submit" className="btn-primary" style={{ padding: '11px 20px', justifyContent: 'center' }}>
              Apply Filters
            </button>
          </form>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} className="text-aqua" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
            <p style={{ fontSize: '1.1rem' }}>Discovering marketplace projects...</p>
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ width: '100%', padding: '20px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px' }}>
            <Briefcase size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>No projects found</h3>
            <p>Try adjusting your search keywords or skill filters to find more opportunities.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '26px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-panel)',
                }}
              >
                <div>
                  {/* Status & Budget Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span
                      className={`badge ${
                        project.status === 'OPEN'
                          ? 'badge-aqua'
                          : project.status === 'IN_PROGRESS'
                          ? 'badge-pink'
                          : 'badge-neutral'
                      }`}
                      style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                    >
                      {project.status}
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-pink)' }}>
                      ${project.budget.toLocaleString()} USD
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="editorial-title"
                    style={{
                      fontSize: '1.35rem',
                      marginBottom: '10px',
                      color: 'var(--text-main)',
                      lineHeight: '1.3',
                    }}
                  >
                    {project.title}
                  </h3>

                  {/* Description Snippet */}
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      marginBottom: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Skill Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {project.skills?.map((item: any) => (
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

                {/* Footer: Client Info & Link */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} className="text-aqua" /> {project.client?.user?.fullName || 'Client'}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
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
                    View project <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary"
              style={{
                opacity: pagination.hasPrevPage ? 1 : 0.4,
                cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                padding: '8px 16px',
                fontSize: '0.88rem',
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="btn-primary"
              style={{
                opacity: pagination.hasNextPage ? 1 : 0.4,
                cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                padding: '8px 16px',
                fontSize: '0.88rem',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
