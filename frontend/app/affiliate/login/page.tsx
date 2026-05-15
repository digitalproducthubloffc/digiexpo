'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, Grid, Cloud } from 'lucide-react';
import { login } from '@/lib/api';
import styles from '@/app/login/login.module.css';
import Navbar from '@/components/Navbar';

export default function AffiliateLoginPage() {
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
       // Using regular login for now, this would ideally hit an affiliate-specific endpoint
       const data = await login({ email, password });
       localStorage.setItem('token', data.token);
       if (data.user?.role) localStorage.setItem('userRole', data.user.role);
       if (data.admin) {
         localStorage.setItem('adminToken', data.token);
         router.push('/admin/dashboard');
       } else {
         router.push('/affiliate/dashboard');
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
    <>
      <Navbar />
      <div className={styles.authPage}>
        
        {/* Top Header Floating */}
        <div className={styles.topLogo}>
          <h1>Digital Product Hub</h1>
          <p>AFFILIATE PORTAL</p>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <h2>Partner Login</h2>
              <p>Enter your details to access your affiliate dashboard.</p>
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
                 <a href="mailto:digitalproducthubloffc@gmail.com?subject=Affiliate%20Password%20Reset%20Request">Forgot Password? Contact Support</a>
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            <p className={styles.footerLink}>
              Want to become a partner? <Link href="/affiliate/apply">Apply Now</Link>
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
             <strong>SECURE PARTNER SESSION</strong>
             <span>End-to-end encrypted login</span>
           </div>
        </div>
      </div>
    </>
  );
}
