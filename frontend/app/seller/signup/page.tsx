'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { becomeSeller } from '@/lib/api';
import { Store, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';

export default function BecomeSeller() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleBecomeSeller = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/seller/signup');
      return;
    }

    setLoading(true);
    try {
      const res = await becomeSeller(token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/seller/dashboard');
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        router.push('/login?redirect=/seller/signup');
      } else {
        setError(err.message || 'Failed to upgrade account');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px' }}>
      <div style={{ maxWidth: '800px', width: '100%', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'flex' }}>
        
        {/* Left Side Info */}
        <div style={{ flex: 1, padding: '48px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <Store size={48} />
            <h1 style={{ fontSize: '2.5rem', margin: '16px 0 8px 0', fontWeight: 800 }}>Start Selling Today</h1>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', lineHeight: 1.6 }}>Join thousands of creators who trust DigiExpo to sell their digital assets, Notion templates, and portfolios.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}><Banknote size={24}/></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Global Payments</h4>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Accept payments from anywhere with automated payouts.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}><ShieldCheck size={24}/></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Verified Badges</h4>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Boost your conversions by getting verified instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Action */}
        <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ color: '#0f172a', fontSize: '1.8rem', marginBottom: '8px' }}>Ready to launch?</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Upgrade your existing account to a Seller account for free.</p>

          {error && <div style={{ padding: '16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

          <button 
            onClick={handleBecomeSeller} 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: '#0f172a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1.1rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Upgrading...' : 'Upgrade to Seller Account'} <ArrowRight size={20} />
          </button>
          
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '24px' }}>
            By upgrading, you agree to our Seller Terms & Conditions.
          </p>
        </div>

      </div>
    </div>
  );
}
