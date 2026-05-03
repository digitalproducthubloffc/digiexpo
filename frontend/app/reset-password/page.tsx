'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import styles from '../login/login.module.css';
import { Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess('Your password has been reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.topLogo}>
        <h1>New Credentials</h1>
        <p>RE-VERIFY IDENTITY</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h2>Finalize Reset</h2>
            <p>Verification code was sent to <br /><strong>{email}</strong></p>
          </div>

          <form className={styles.form} onSubmit={handleReset}>
            <div className={styles.inputGroup}>
              <label>OTP CODE</label>
              <input 
                type="text" 
                placeholder="000000" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.8rem', fontSize: '1.25rem', fontWeight: 700 }}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter a strong password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100% '}}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#64748b' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg} style={{ color: '#10b981', textAlign: 'center', fontSize: '0.85rem' }}>{success}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Restoring Access...' : 'Finalize Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading authentication portal...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
