'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import styles from './LoginModal.module.css';

type Mode = 'login' | 'register';

export const LoginModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const { loginModalOpen, closeLoginModal } = useUIStore();
  const [mode, setMode] = useState<Mode>('login');

  const isCheckoutPage = pathname === '/checkout';
  const isForced = isCheckoutPage && !user;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });

  const shouldShow = loginModalOpen || isForced;
  if (!shouldShow) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await nextAuthSignIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password.');
      }

      // 1. Get the session to populate our Zustand store immediately
      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session.user) {
          setUser({
            id: session.wpId,
            email: session.user.email,
            firstName: session.wpFirstName,
            lastName: session.wpLastName,
            displayName: session.user.name,
            token: session.wpToken,
          });
        }
      }

      closeLoginModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      // Call the server-side route so WC credentials stay off the browser
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.message || 'Registration failed.');

      // Now log them in with their new credentials via server route
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || 'Login after registration failed.');
      setUser({
        id: loginData.id,
        email: loginData.user_email,
        firstName: loginData.first_name,
        lastName: loginData.last_name,
        displayName: loginData.user_display_name,
        token: loginData.token,
      });

      // Synchronize with NextAuth session so the Header and Guard stay in sync
      await nextAuthSignIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      closeLoginModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message?.replace(/<[^>]+>/g, '') || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={isForced ? undefined : closeLoginModal}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {!isForced && <button className={styles.closeBtn} onClick={closeLoginModal}>✕</button>}

        {mode === 'login' ? (
          <>
            <h2 className={styles.title}>Login</h2>
            <form className={styles.form} onSubmit={handleLogin}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input className={styles.input} type="email" name="email"
                  value={form.email} onChange={handleChange} required placeholder="hello@example.com" />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formGroupRow}>
                  <label className={styles.label}>Password</label>
                  <button type="button" className={styles.forgotLink}>Forgot Password</button>
                </div>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button className={styles.submitBtn} type="submit" disabled={isLoading}>
                {isLoading ? 'SIGNING IN...' : 'CONTINUE'} →
              </button>
            </form>

            <div className={styles.divider}>or continue with</div>
            <div className={styles.socialRow}>
              <button
                className={styles.socialBtn}
                onClick={() => {
                  closeLoginModal();
                  nextAuthSignIn('google', { callbackUrl: window.location.href });
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
            </div>

            <p className={styles.signupRow}>
              Don&apos;t have an Account?{' '}
              <button className={styles.signupLink} onClick={() => { setMode('register'); setError(null); }}>
                Sign up here
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Create Account</h2>
            <form className={styles.form} onSubmit={handleRegister}>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <input className={styles.input} type="text" name="firstName"
                    value={form.firstName} onChange={handleChange} required placeholder="First" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input className={styles.input} type="text" name="lastName"
                    value={form.lastName} onChange={handleChange} required placeholder="Last" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input className={styles.input} type="email" name="email"
                  value={form.email} onChange={handleChange} required placeholder="hello@example.com" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 8 characters"
                    minLength={8}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(v => !v)}>
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button className={styles.submitBtn} type="submit" disabled={isLoading}>
                {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'} →
              </button>
            </form>
            <p className={styles.signupRow}>
              Already have an account?{' '}
              <button className={styles.signupLink} onClick={() => { setMode('login'); setError(null); }}>
                Sign in
              </button>
            </p>
          </>
        )}

        {isForced && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.25rem' }}>
            <button 
              type="button" 
              onClick={() => router.push('/cart')}
              style={{
                background: 'none',
                border: 'none',
                color: '#8FA899',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                fontWeight: '500'
              }}
            >
              ← Return to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
