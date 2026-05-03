'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp } from '@/lib/api';
import styles from '../login/login.module.css';
import { ShieldCheck, Mail } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const data = await verifyOtp(email, otp);
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.topLogo}>
        <h1>Verify Account</h1>
        <p>SECURE ARCHIVE ACCESS</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h2>Enter 6-Digit Code</h2>
            <p>We've sent a verification code to <br /><strong>{email}</strong></p>
          </div>

          <form className={styles.form} onSubmit={handleVerify}>
            <div className={styles.inputGroup}>
              <label>OTP CODE</label>
              <input 
                type="text" 
                placeholder="000000" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '1rem', fontSize: '1.5rem', fontWeight: 800 }}
                required
              />
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <p className={styles.footerLink}>
            Didn't receive the code? <button style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, cursor: 'pointer' }}>Resend Email</button>
          </p>
        </div>
      </div>

      <div className={styles.secureBadge}>
         <div className={styles.secureIcon}><ShieldCheck size={20} color="#10b981" /></div>
         <div className={styles.secureText}>
           <strong>VERIFIED SESSION</strong>
           <span>Waiting for archivist handshake</span>
         </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
