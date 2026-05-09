'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, Grid, Cloud } from 'lucide-react';
import { signup } from '@/lib/api';
import styles from '../login/login.module.css';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Onboarding questions
  const [favoriteProduct, setFavoriteProduct] = useState('E-Books');
  const [discoverySource, setDiscoverySource] = useState('Instagram');
  const [knowsDigitalCreation, setKnowsDigitalCreation] = useState('Yes');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await signup({ 
        name, 
        email, 
        password,
        onboarding: {
          favoriteProduct,
          discoverySource,
          knowsDigitalCreation
        }
      });
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
            <h2>{step === 1 ? 'Create Account' : 'Almost There!'}</h2>
            <p>{step === 1 ? 'Join Digital Product Hub today.' : 'Tell us a little bit about yourself.'}</p>
          </div>

          {step === 1 ? (
            <form className={styles.form} onSubmit={handleStepOne}>
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

              <button type="submit" className={styles.submitBtn}>
                Create Account
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleFinalSubmit}>
              <div className={styles.inputGroup}>
                <label>WHICH PRODUCT DO YOU LIKE MOST?</label>
                <select value={favoriteProduct} onChange={(e) => setFavoriteProduct(e.target.value)} required className={styles.selectInput}>
                  <option value="E-Books">E-Books</option>
                  <option value="Architectural Plans">Architectural Plans</option>
                  <option value="3D Assets">3D Assets</option>
                  <option value="Templates">Templates</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>WHERE DID YOU FIND THIS WEBSITE?</label>
                <select value={discoverySource} onChange={(e) => setDiscoverySource(e.target.value)} required className={styles.selectInput}>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Google">Google</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>DO YOU KNOW HOW TO MAKE DIGITAL PRODUCTS?</label>
                <select value={knowsDigitalCreation} onChange={(e) => setKnowsDigitalCreation(e.target.value)} required className={styles.selectInput}>
                  <option value="Yes">Yes, I'm a creator</option>
                  <option value="No">No, I'm just looking</option>
                  <option value="Learning">I'm currently learning</option>
                </select>
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              <div className={styles.stepButtonGroup}>
                <button type="button" onClick={() => setStep(1)} className={styles.secondaryBtn}>
                  Back
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn} style={{ marginTop: 0 }}>
                  {loading ? 'Completing...' : 'Finish & Enter'}
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <p className={styles.footerLink}>
               Already an archivist? <Link href="/login">Sign In</Link>
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
           <strong>SECURE SESSION</strong>
           <span>Data encrypted in transit</span>
         </div>
      </div>
    </div>
  );
}
