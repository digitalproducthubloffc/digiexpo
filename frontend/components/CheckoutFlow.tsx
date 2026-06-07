'use client';

import { useState } from 'react';
import PaymentForm from './PaymentForm';
import { ShieldCheck, Download, DollarSign, IndianRupee } from 'lucide-react';
import styles from '../app/checkout/checkout.module.css';

export default function CheckoutFlow({ product }: { product: any }) {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');

  // USD Pricing
  const subtotalUSD = product.originalPrice || product.realPrice;
  const discountUSD = product.originalPrice > product.realPrice ? product.originalPrice - product.realPrice : 0;
  const platformFeeUSD = 0.30;
  const totalUSD = product.realPrice + platformFeeUSD;

  // INR Pricing
  const priceINR = product.priceINR || (product.realPrice * 85); // Fallback if admin hasn't set it yet
  const platformFeeINR = 25; // roughly 30 cents in INR
  const totalINR = priceINR + platformFeeINR;

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

        <div className={styles.priceBreakdown}>
          {currency === 'USD' ? (
            <>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>${subtotalUSD?.toFixed(2)}</span>
              </div>
              {discountUSD > 0 && (
                <div className={`${styles.priceRow} ${styles.discount}`}>
                  <span>Discount</span>
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
                <span>₹{priceINR}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Platform Fee</span>
                <span>₹{platformFeeINR}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total (INR)</span>
                <span>₹{totalINR}</span>
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
            selectedCurrency: currency
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
