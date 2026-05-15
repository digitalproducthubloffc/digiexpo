'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile, BASE_URL } from '@/lib/api';
import { TrendingUp, DollarSign, MousePointerClick, Activity, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
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

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className={styles.dashboard} style={{ display: 'block', paddingTop: '80px' }}>
        <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', display: 'block' }}>
          {/* Main Content */}
          <main className={styles.mainContent} style={{ width: '100%', padding: '2rem' }}>
            <div className={styles.sectionHeader}>
              <h2 style={{ fontSize: '2.5rem' }}>Welcome back, {user.name.split(' ')[0]}!</h2>
              <p>Track your referrals, commissions, and performance.</p>
            </div>

            {/* Coming Soon Banner */}
            <div className={styles.statusBanner} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2.5rem', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #ddd6fe' }}>
              <Clock size={40} strokeWidth={1.5} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Products & Referral Links Coming Soon</h3>
                <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: '1rem' }}>We will share products soon stay tuned and link too. We're currently preparing your unique partner assets.</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard} style={{ padding: '2rem' }}>
                <div className={styles.statIcon} style={{ width: '60px', height: '60px' }}><DollarSign size={28} /></div>
                <div className={styles.statInfo}>
                  <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>TOTAL COMMISSION</span>
                  <h3 style={{ fontSize: '2rem' }}>${stats.totalCommission.toFixed(2)}</h3>
                </div>
              </div>

              <div className={styles.statCard} style={{ padding: '2rem' }}>
                <div className={styles.statIcon} style={{ width: '60px', height: '60px' }}><TrendingUp size={28} /></div>
                <div className={styles.statInfo}>
                  <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>TOTAL REFERRALS</span>
                  <h3 style={{ fontSize: '2rem' }}>{stats.totalSales} Sales</h3>
                </div>
              </div>

              <div className={styles.statCard} style={{ padding: '2rem' }}>
                <div className={styles.statIcon} style={{ width: '60px', height: '60px' }}><MousePointerClick size={28} /></div>
                <div className={styles.statInfo}>
                  <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>LINK CLICKS</span>
                  <h3 style={{ fontSize: '2rem' }}>{stats.clicks}</h3>
                </div>
              </div>

              <div className={styles.statCard} style={{ padding: '2rem' }}>
                <div className={styles.statIcon} style={{ width: '60px', height: '60px' }}><Activity size={28} /></div>
                <div className={styles.statInfo}>
                  <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>CONVERSION RATE</span>
                  <h3 style={{ fontSize: '2rem' }}>{stats.conversionRate}</h3>
                </div>
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className={styles.recentSales} style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.5rem' }}>Recent Conversions</h3>
              <div className={styles.emptyTable} style={{ padding: '4rem 0' }}>
                No recent conversions found. Once products are live and you start sharing your link, your sales will appear here.
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


