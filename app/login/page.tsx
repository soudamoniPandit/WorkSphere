'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import WorkSphereLogo from '@/components/WorkSphereLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        if (res.data.user.role === 'CLIENT') {
          router.push('/client/dashboard');
        } else {
          router.push('/freelancer/dashboard');
        }
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: 'clamp(24px, 5vw, 40px) clamp(18px, 4.5vw, 36px)',
          borderRadius: '24px',
          background: 'var(--bg-panel)',
          boxShadow: 'var(--card-shadow)',
          position: 'relative',
        }}
      >
        {/* Logo Mark Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <WorkSphereLogo size={42} showText={false} />
          </div>
          <h1 className="editorial-title" style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Sign in to access your projects and pitches
          </p>
        </div>

        {error && (
          <div className="badge badge-error" style={{ width: '100%', padding: '12px', marginBottom: '20px', justifyContent: 'center', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              justifyContent: 'center',
              fontSize: '1rem',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            {loading ? 'Signing in...' : <><span>Sign In to WorkSphere</span> <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Don&apos;t have an account yet?{' '}
          <Link href="/register" style={{ color: 'var(--accent-pink)', fontWeight: '700', textDecoration: 'none' }}>
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
