'use client';

import { useState } from 'react';
import PaymentForm from './PaymentForm';
import { ShieldCheck, Download, DollarSign, IndianRupee, Tag } from 'lucide-react';
import styles from '../app/checkout/checkout.module.css';
import { validateCoupon } from '@/lib/api';

export default function CheckoutFlow({ product }: { product: any }) {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  
  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError('');
    try {
      const res = await validateCoupon(couponInput.trim());
      setAppliedCoupon(res);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // USD Pricing
  const originalSubtotalUSD = product.originalPrice || product.realPrice;
  let basePriceUSD = product.realPrice;
  let discountUSD = originalSubtotalUSD > basePriceUSD ? originalSubtotalUSD - basePriceUSD : 0;
  
  // INR Pricing
  const originalPriceINR = product.priceINR || (product.realPrice * 85);
  let basePriceINR = originalPriceINR;

  // Apply Coupon
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      const pct = appliedCoupon.discountValue / 100;
      discountUSD += (basePriceUSD * pct);
      basePriceUSD = basePriceUSD - (basePriceUSD * pct);
      basePriceINR = basePriceINR - (basePriceINR * pct);
    } else if (appliedCoupon.discountType === 'fixed') {
      discountUSD += appliedCoupon.discountValue;
      basePriceUSD = Math.max(0, basePriceUSD - appliedCoupon.discountValue);
      basePriceINR = Math.max(0, basePriceINR - (appliedCoupon.discountValue * 85));
    }
  }

  const platformFeeUSD = 0.30;
  const totalUSD = basePriceUSD + platformFeeUSD;

  const platformFeeINR = 25; // roughly 30 cents in INR
  const totalINR = basePriceINR + platformFeeINR;

  return (
    <div className={styles.layout}>
      {/* Left: Order Summary */}
      <div className={styles.orderSummary}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Order Summary</h2>
          
          <div className="currency-toggle" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setCurrency('INR')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: currency === 'INR' ? '#fff' : 'transparent',
                boxShadow: currency === 'INR' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: currency === 'INR' ? '#7c3aed' : '#64748b',
                fontWeight: currency === 'INR' ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <IndianRupee size={14} /> INR
            </button>
            <button 
              onClick={() => setCurrency('USD')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: currency === 'USD' ? '#fff' : 'transparent',
                boxShadow: currency === 'USD' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: currency === 'USD' ? '#7c3aed' : '#64748b',
                fontWeight: currency === 'USD' ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <DollarSign size={14} /> USD
            </button>
          </div>
        </div>

        <div className={styles.productCard}>
          <div className={styles.productImage}>
            <img src={product.image} alt={product.title} />
          </div>
          <div className={styles.productInfo}>
            <span className={styles.category}>{product.category}</span>
            <h3>{product.title}</h3>
            <p className={styles.desc}>{product.description?.substring(0, 120)}...</p>
            <div className={styles.meta}>
              <span>{product.fileType || 'PDF'}</span>
              <span>•</span>
              <span>{product.fileSize || 'Digital'}</span>
              <span>•</span>
              <span>Instant Download</span>
            </div>
          </div>
        </div>

        {/* Features */}
        {product.details && product.details.length > 0 && (
          <div className={styles.featuresList}>
            <p className={styles.galleryLabel}>What You'll Get</p>
            <ul>
              {product.details.map((d: string, i: number) => (
                <li key={i}>
                  <Download size={14} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={16}/> Promo Code</span>
          </div>
          {appliedCoupon ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ color: '#059669', fontWeight: 'bold' }}>{appliedCoupon.code} Applied!</span>
              <button onClick={handleRemoveCoupon} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Remove</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter code" 
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={applying || !couponInput.trim()}
                style={{ padding: '0 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: (applying || !couponInput.trim()) ? 0.7 : 1 }}
              >
                {applying ? '...' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>{couponError}</p>}
        </div>

        <div className={styles.priceBreakdown}>
          {currency === 'USD' ? (
            <>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>${originalSubtotalUSD?.toFixed(2)}</span>
              </div>
              {discountUSD > 0 && (
                <div className={`${styles.priceRow} ${styles.discount}`}>
                  <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                  <span>-${discountUSD.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.priceRow}>
                <span>Platform Fee</span>
                <span>${platformFeeUSD.toFixed(2)}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total (USD)</span>
                <span>${totalUSD.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>₹{originalPriceINR}</span>
              </div>
              {appliedCoupon && (
                <div className={`${styles.priceRow} ${styles.discount}`}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{(originalPriceINR - basePriceINR).toFixed(2)}</span>
                </div>
              )}
              <div className={styles.priceRow}>
                <span>Platform Fee</span>
                <span>₹{platformFeeINR}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total (INR)</span>
                <span>₹{totalINR.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Payment Form */}
      <div className={styles.paymentColumn}>
        <PaymentForm 
          product={{
            ...product,
            calculatedTotal: currency === 'USD' ? totalUSD : totalINR,
            selectedCurrency: currency,
            appliedCouponCode: appliedCoupon ? appliedCoupon.code : null
          }} 
        />
        
        <div className={styles.refundNotice}>
          <ShieldCheck size={16} />
          <p><strong>Digital Product Notice:</strong> Due to the nature of digital assets, this product is non-refundable. Once purchased, you will receive permanent access to the files.</p>
        </div>
      </div>
    </div>
  );
}
