'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import WorkSphereLogo from '@/components/WorkSphereLogo';

type UserRole = 'CLIENT' | 'FREELANCER';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  Code,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('FREELANCER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authService.register({
        fullName,
        email,
        password,
        role,
      });

      if (res.success && res.data) {
        if (role === 'CLIENT') {
          router.push('/client/dashboard');
        } else {
          router.push('/freelancer/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error registering account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px 36px',
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
            Join WorkSphere
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Choose your account type to get started
          </p>
        </div>

        {error && (
          <div className="badge badge-error" style={{ width: '100%', padding: '12px', marginBottom: '20px', justifyContent: 'center', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div
              onClick={() => setRole('FREELANCER')}
              style={{
                border: `2px solid ${role === 'FREELANCER' ? 'var(--accent-aqua)' : 'var(--border-color)'}`,
                background: role === 'FREELANCER' ? 'var(--accent-aqua-subtle)' : 'var(--bg-input)',
                borderRadius: '14px',
                padding: '16px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 180ms ease',
              }}
            >
              <div style={{ color: role === 'FREELANCER' ? 'var(--accent-aqua)' : 'var(--text-dim)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                <Code size={24} />
              </div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                Freelancer
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                I want to pitch & build
              </div>
            </div>

            <div
              onClick={() => setRole('CLIENT')}
              style={{
                border: `2px solid ${role === 'CLIENT' ? 'var(--accent-pink)' : 'var(--border-color)'}`,
                background: role === 'CLIENT' ? 'var(--accent-pink-subtle)' : 'var(--bg-input)',
                borderRadius: '14px',
                padding: '16px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 180ms ease',
              }}
            >
              <div style={{ color: role === 'CLIENT' ? 'var(--accent-pink)' : 'var(--text-dim)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                <Briefcase size={24} />
              </div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                Client
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                I want to hire talent
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              Full name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Aisha Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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

          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
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
          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              Password (min. 6 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            {loading ? 'Creating account...' : <><span>Create {role === 'CLIENT' ? 'Client' : 'Freelancer'} Account</span> <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-pink)', fontWeight: '700', textDecoration: 'none' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
