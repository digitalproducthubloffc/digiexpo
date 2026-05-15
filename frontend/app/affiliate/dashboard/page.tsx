'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile, BASE_URL } from '@/lib/api';
import { TrendingUp, DollarSign, MousePointerClick, Activity, LogOut, Home, Clock } from 'lucide-react';
import styles from '@/app/admin/dashboard/dashboard.module.css';

export default function AffiliateDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Reset stats to zero for initial launch
  const stats = {
    totalSales: 0,
    totalCommission: 0,
    clicks: 0,
    conversionRate: '0%'
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/affiliate/login');
      return;
    }
    setToken(t);
    
    fetchUserProfile(t).then(data => {
      if(data.user.role !== 'affiliate' && !data.user.isAdmin) {
         router.push('/dashboard');
      }
      setUser(data.user);
    }).catch(() => {
      localStorage.removeItem('token');
      router.push('/affiliate/login');
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/affiliate/login');
  };

  if (!user) return null;

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

          {/* Coming Soon Banner */}
          <div className={styles.statusBanner} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <Clock size={32} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Products & Referral Links Coming Soon</h3>
              <p style={{ margin: '5px 0 0', opacity: 0.8 }}>We will share products soon stay tuned and link too. We're currently preparing your unique partner assets.</p>
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
          <div className={styles.recentSales} style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Recent Conversions</h3>
            <div className={styles.emptyTable}>
              No recent conversions found. Once products are live and you start sharing your link, your sales will appear here.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

