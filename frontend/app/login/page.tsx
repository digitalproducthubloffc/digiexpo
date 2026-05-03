'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, Grid, Cloud } from 'lucide-react';
import { login } from '@/lib/api';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
       const data = await login({ email, password });
       localStorage.setItem('token', data.token);
       if (data.admin) {
         localStorage.setItem('adminToken', data.token);
         router.push('/admin/dashboard');
       } else {
         router.push('/');
       }
    } catch (err: any) {
      if (err.message.includes('verify')) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.message || 'Error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      
      {/* Top Header Floating */}
      <div className={styles.topLogo}>
        <h1>Digital Product Hub</h1>
        <p>CURATED EXCELLENCE</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h2>Welcome back</h2>
            <p>Enter your details to access your curated collection.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.forgotPassword}>
               <Link href="/forgot-password">Forgot Password?</Link>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className={styles.footerLink}>
            Don't have an account? <Link href="/signup">Create an Account</Link>
          </p>
        </div>

        {/* Faint subtle icons below the card */}
        <div className={styles.subtleIcons}>
           <Sparkles size={16} />
           <Grid size={16} />
           <Cloud size={16} />
        </div>
      </div>

      {/* Floating Secure Badge Corner */}
      <div className={styles.secureBadge}>
         <div className={styles.secureIcon}>
           <ShieldCheck size={20} color="#10b981" />
         </div>
         <div className={styles.secureText}>
           <strong>SECURE SESSION</strong>
           <span>End-to-end encrypted login</span>
         </div>
      </div>
    </div>
  );
}
