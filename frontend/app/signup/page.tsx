'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, Grid, Cloud } from 'lucide-react';
import { signup } from '@/lib/api';
import styles from '../login/login.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
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
      const data = await signup({ name, email, password });
      localStorage.setItem('token', data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      
      {/* Top Header Floating */}
      <div className={styles.topLogo}>
        <h1>Digital Product Hub</h1>
        <p>SECURE ARCHIVE ACCESS</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h2>Create Account</h2>
            <p>Join Digital Product Hub today.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>FULL NAME</label>
              <input 
                type="text" 
                placeholder="Alexander Vance" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={styles.footerLink}>
             Already an archivist? <Link href="/login">Sign In</Link>
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
           <span>Data encrypted in transit</span>
         </div>
      </div>
    </div>
  );
}
