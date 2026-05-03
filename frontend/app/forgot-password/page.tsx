'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword } from '@/lib/api';
import styles from '../login/login.module.css';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await forgotPassword(email);
      setMessage('A reset code has been sent to your inbox.');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Could not initiate reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.topLogo}>
        <h1>Restoration Hub</h1>
        <p>RECOVER YOUR ACCOUNT</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h2>Forgot Password?</h2>
            <p>Enter your email and we'll send a <br />6-digit access code.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="archivist@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {message && <div className={styles.successMsg} style={{ color: '#10b981', textAlign: 'center', fontSize: '0.85rem', marginBottom: '1rem' }}>{message}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Sending Code...' : 'Send Access Code'}
            </button>
          </form>

          <p className={styles.footerLink}>
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
