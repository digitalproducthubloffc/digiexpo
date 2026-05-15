'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile, BASE_URL } from '@/lib/api';
import { Copy, CheckCircle2, TrendingUp, DollarSign, MousePointerClick, Activity, LogOut, Home } from 'lucide-react';
import styles from './affiliateDashboard.module.css';

export default function AffiliateDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Mocked analytics for MVP until tracking is fully built
  const stats = {
    totalSales: 12,
    totalCommission: 340.50,
    clicks: 1245,
    conversionRate: '0.96%'
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/affiliate/login');
      return;
    }
    setToken(t);
    
    // Fetch user to get their ID to generate the ref link
    fetchUserProfile(t).then(data => {
      // If user is not an affiliate, we can bounce them or just let them be an affiliate
      if(data.role !== 'affiliate' && !data.isAdmin) {
         // Optionally bounce to normal dashboard
         // router.push('/dashboard');
      }
      setUser(data);
    }).catch(() => {
      localStorage.removeItem('token');
      router.push('/affiliate/login');
    });
  }, []);

  const handleCopy = () => {
    if (!user) return;
    const link = `https://digitalproductsy.com/?ref=${user._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/affiliate/login');
  };

  if (!user) return null; // or a loading spinner

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.brand}>
             <h2>PARTNER HUB</h2>
             <p>AFFILIATE PORTAL</p>
          </div>
          
          <nav className={styles.nav}>
            <button className={styles.active}>
              <Activity size={20} /> Overview
            </button>
            <button onClick={() => router.push('/')}>
              <Home size={20} /> Back to Store
            </button>
          </nav>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} style={{ marginRight: '8px' }} /> Logout
          </button>
        </div>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.sectionHeader}>
            <h2>Welcome back, {user.name.split(' ')[0]}!</h2>
            <p>Track your referrals, commissions, and performance.</p>
          </div>

          {/* Unique Affiliate Link Generator */}
          <div className={styles.linkGenerator}>
            <div className={styles.linkInfo}>
              <h3>Your Unique Referral Link</h3>
              <p>Share this link on your socials. Any purchases made within 30 days will earn you commission.</p>
            </div>
            <div className={styles.linkBox}>
              <span>https://digitalproductsy.com/?ref={user._id}</span>
              <button onClick={handleCopy} className={styles.copyBtn}>
                {copied ? <><CheckCircle2 size={18} /> Copied!</> : <><Copy size={18} /> Copy Link</>}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><DollarSign size={24} /></div>
              <div className={styles.statInfo}>
                <span>Total Commission</span>
                <h3>${stats.totalCommission.toFixed(2)}</h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><TrendingUp size={24} /></div>
              <div className={styles.statInfo}>
                <span>Total Referrals</span>
                <h3>{stats.totalSales} Sales</h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><MousePointerClick size={24} /></div>
              <div className={styles.statInfo}>
                <span>Link Clicks</span>
                <h3>{stats.clicks}</h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><Activity size={24} /></div>
              <div className={styles.statInfo}>
                <span>Conversion Rate</span>
                <h3>{stats.conversionRate}</h3>
              </div>
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className={styles.recentSales}>
            <h3>Recent Conversions</h3>
            <div className={styles.emptyState}>
              No recent conversions found in the last 7 days.
              <br />
              Keep sharing your link to earn more!
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
