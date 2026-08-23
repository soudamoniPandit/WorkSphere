'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import ThemeToggle from '@/components/ThemeToggle';
import WorkSphereLogo from '@/components/WorkSphereLogo';
import {
  User,
  LogOut,
  PlusCircle,
  FolderKanban,
  FileText,
  MessageSquare,
  Compass,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  Bell,
  ChevronDown,
  Briefcase,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const checkUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/';
  };

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  return (
    <nav
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 28px',
        transition: 'background-color 200ms ease, border-color 200ms ease',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Brand Logo */}
        <Link
          href={
            user?.role === 'CLIENT'
              ? '/client/dashboard'
              : user?.role === 'FREELANCER'
              ? '/freelancer/dashboard'
              : '/'
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <WorkSphereLogo size={36} withText={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          className="desktop-nav-links"
        >
          {user?.role === 'CLIENT' ? (
            <>
              <Link
                href="/client/dashboard"
                style={{
                  color: isActive('/client/dashboard') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/client/dashboard') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/client/dashboard') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <Briefcase size={16} className={isActive('/client/dashboard') ? 'text-violet' : 'text-dim'} /> Dashboard
              </Link>
              <Link
                href="/projects/create"
                style={{
                  color: isActive('/projects/create') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/projects/create') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/projects/create') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <PlusCircle size={16} className={isActive('/projects/create') ? 'text-pink' : 'text-dim'} /> Post Project
              </Link>
              <Link
                href="/client/projects"
                style={{
                  color: isActive('/client/projects') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/client/projects') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/client/projects') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <FolderKanban size={16} className={isActive('/client/projects') ? 'text-aqua' : 'text-dim'} /> My Projects
              </Link>
              <Link
                href="/messages"
                style={{
                  color: isActive('/messages') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/messages') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/messages') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <MessageSquare size={16} className={isActive('/messages') ? 'text-pink' : 'text-dim'} /> Messages
              </Link>
              <Link
                href="/profile"
                style={{
                  color: isActive('/profile') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/profile') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/profile') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <User size={16} className={isActive('/profile') ? 'text-lavender' : 'text-dim'} /> Profile
              </Link>
            </>
          ) : user?.role === 'FREELANCER' ? (
            <>
              <Link
                href="/freelancer/dashboard"
                style={{
                  color: isActive('/freelancer/dashboard') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/freelancer/dashboard') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/freelancer/dashboard') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <Search size={15} className={isActive('/freelancer/dashboard') ? 'text-aqua' : 'text-dim'} /> Discover
              </Link>
              <Link
                href="/freelancer/proposals"
                style={{
                  color: isActive('/freelancer/proposals') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/freelancer/proposals') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/freelancer/proposals') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <FileText size={15} className={isActive('/freelancer/proposals') ? 'text-pink' : 'text-dim'} /> Proposals
              </Link>
              <Link
                href="/projects"
                style={{
                  color: isActive('/projects') && !isActive('/projects/create') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/projects') && !isActive('/projects/create') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/projects') && !isActive('/projects/create') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <FolderKanban size={15} className={isActive('/projects') ? 'text-violet' : 'text-dim'} /> Projects
              </Link>
              <Link
                href="/freelancer/work"
                style={{
                  color: isActive('/freelancer/work') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/freelancer/work') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/freelancer/work') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <CheckCircle2 size={15} className={isActive('/freelancer/work') ? 'text-success' : 'text-dim'} /> My Work
              </Link>
              <Link
                href="/messages"
                style={{
                  color: isActive('/messages') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/messages') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/messages') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <MessageSquare size={15} className={isActive('/messages') ? 'text-pink' : 'text-dim'} /> Messages
              </Link>
              <Link
                href="/profile"
                style={{
                  color: isActive('/profile') ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive('/profile') ? 'var(--bg-surface-elevated)' : 'transparent',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: isActive('/profile') ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  transition: 'all 180ms ease',
                }}
              >
                <Sparkles size={15} className={isActive('/profile') ? 'text-aqua' : 'text-dim'} /> Portfolio
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/projects"
                style={{
                  color: isActive('/projects') ? 'var(--text-main)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                }}
              >
                Explore work
              </Link>
              <span style={{ color: 'var(--border-color)', fontSize: '0.9rem' }}>•</span>
              <Link
                href="/freelancers"
                style={{
                  color: isActive('/freelancers') ? 'var(--text-main)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                }}
              >
                Find talent
              </Link>
            </>
          )}
        </div>

        {/* Right Section: Notification, Theme Toggle & User Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Notification Bell */}
          <button
            type="button"
            title="Notifications"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <Bell size={19} />
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-pink)',
              }}
            />
          </button>

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: userMenuOpen ? 'var(--bg-surface)' : 'transparent',
                  transition: 'background 180ms ease',
                }}
              >
                {/* Circular Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background:
                      user.role === 'CLIENT'
                        ? 'linear-gradient(135deg, #F48AC2 0%, #7C3AED 100%)'
                        : 'linear-gradient(135deg, #25D9D2 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    border: '1.5px solid var(--border-color)',
                  }}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={{ textAlign: 'left', display: 'none', minWidth: '80px' }} className="user-text-info">
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                    {user.role}
                  </div>
                </div>

                <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} />
              </div>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    boxShadow: 'var(--card-shadow)',
                    padding: '8px',
                    zIndex: 200,
                    animation: 'fadeIn 180ms ease',
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-aqua)' }}>
                      {user.role === 'CLIENT' ? 'Client Account' : 'Verified Freelancer'}
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      transition: 'background 180ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={15} /> View Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: 'var(--accent-pink)',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 180ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-pink-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/login"
                style={{
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  transition: 'color 180ms ease',
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{ fontSize: '0.9rem', padding: '9px 18px' }}
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '20px 8px',
            borderTop: '1px solid var(--border-color)',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {user?.role === 'CLIENT' ? (
            <>
              <Link href="/client/dashboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Briefcase size={16} /> Dashboard
              </Link>
              <Link href="/projects/create" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <PlusCircle size={16} /> Post Project
              </Link>
              <Link href="/client/projects" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <FolderKanban size={16} /> My Projects
              </Link>
              <Link href="/messages" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <MessageSquare size={16} /> Messages
              </Link>
              <Link href="/profile" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <User size={16} /> Profile
              </Link>
            </>
          ) : user?.role === 'FREELANCER' ? (
            <>
              <Link href="/freelancer/dashboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Search size={16} /> Discover
              </Link>
              <Link href="/freelancer/proposals" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <FileText size={16} /> Proposals
              </Link>
              <Link href="/projects" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <FolderKanban size={16} /> Projects
              </Link>
              <Link href="/freelancer/work" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <CheckCircle2 size={16} /> My Work
              </Link>
              <Link href="/messages" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <MessageSquare size={16} /> Messages
              </Link>
              <Link href="/profile" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Sparkles size={16} /> Portfolio & Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/projects" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                Explore work
              </Link>
              <Link href="/freelancers" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                Find talent
              </Link>
              <Link href="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                Log in
              </Link>
              <Link href="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Get started
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 880px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .user-text-info {
            display: none !important;
          }
        }
        @media (min-width: 881px) {
          .user-text-info {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
