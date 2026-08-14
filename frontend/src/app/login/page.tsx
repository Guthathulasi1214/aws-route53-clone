'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">R53</div>
          <div>
            <div className="login-logo-name">AWS Route 53</div>
            <div className="login-logo-sub">DNS Management Console</div>
          </div>
        </div>

        <h1 className="login-heading">Sign in</h1>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
            id="sign-in-btn"
            style={{ marginTop: 8 }}
          >
            {isLoading ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="login-demo">
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
            Demo credentials:
          </div>
          <div>Email: <span style={{ color: 'var(--text-primary)' }}>admin@route53.local</span></div>
          <div>Password: <span style={{ color: 'var(--text-primary)' }}>admin123</span></div>
        </div>

      </div>
    </div>
  );
}
