'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Grid, Cloud } from 'lucide-react';
import styles from '@/app/login/login.module.css';
import Navbar from '@/components/Navbar';
import { applyAffiliate } from '@/lib/api';

export default function AffiliateApplyPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [audienceSize, setAudienceSize] = useState('Under 10k');
  const [commission, setCommission] = useState('20%');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await applyAffiliate({ name, email, password, website, audienceSize, commission });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
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
          <p>AFFILIATE PARTNERSHIP</p>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <h2>{submitted ? 'Application Received!' : 'Become a Partner'}</h2>
              <p>
                {submitted 
                  ? 'Your details are submitted and we will analyze your social media platform. Stay tuned!' 
                  : 'Apply to join our exclusive affiliate program today.'}
              </p>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Link href="/" className={styles.submitBtn} style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Return Home
                </Link>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label>FULL NAME</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
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
                    placeholder="Create a strong password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>WEBSITE OR SOCIAL MEDIA LINK</label>
                  <input 
                    type="url" 
                    placeholder="https://instagram.com/yourprofile" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>ESTIMATED AUDIENCE SIZE</label>
                  <select 
                    value={audienceSize} 
                    onChange={(e) => setAudienceSize(e.target.value)} 
                    required 
                    className={styles.selectInput}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', color: '#1e293b' }}
                  >
                    <option value="Under 10k">Under 10,000</option>
                    <option value="10k-50k">10,000 - 50,000</option>
                    <option value="50k-100k">50,000 - 100,000</option>
                    <option value="100k+">100,000+</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>REQUESTED COMMISSION RATE</label>
                  <select 
                    value={commission} 
                    onChange={(e) => setCommission(e.target.value)} 
                    required 
                    className={styles.selectInput}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', color: '#1e293b' }}
                  >
                    <option value="10%">10% Commission</option>
                    <option value="20%">20% Commission</option>
                    <option value="30%">30% Commission</option>
                  </select>
                </div>

                {error && <div className={styles.errorMsg} style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}

            {!submitted && (
              <p className={styles.footerLink}>
                Already an affiliate? <Link href="/affiliate/login">Partner Login</Link>
              </p>
            )}
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
            <strong>SECURE APPLICATION</strong>
            <span>Your data is protected</span>
          </div>
        </div>
      </div>
    </>
  );
}
