'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, CreditCard, Mail } from 'lucide-react';
import styles from '../app/checkout/checkout.module.css';
import { API_URL } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentForm({ product }: { product: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    password: ''
  });
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const initiateGuestVerify = async () => {
    if (!guestInfo.name || !guestInfo.email || !guestInfo.password) {
      setError('Please provide your name, email, and a password to create your account.');
      return;
    }
    setIsProcessing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/checkout-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestInfo)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Save session token directly without OTP
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      
      setSuccess('Account ready! Proceeding to payment gateway...');
      
      setTimeout(() => {
        executePayment(data.token);
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const executePayment = async (token: string) => {
    try {
      const orderRes = await fetch(`${API_URL}/payments/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          amount: product.calculatedTotal,
          currency: product.selectedCurrency
        })
      });

      console.log('--- BROWSER PAYMENT DIAGNOSTICS ---');
      console.log('Backend response status:', orderRes.status);
      
      const orderData = await orderRes.json();
      console.log('Backend response data:', orderData);
      
      if (!orderRes.ok) {
        console.error('Backend rejected order creation. This is usually due to Razorpay KYC lock or invalid keys.');
        console.error('Full Error Object:', orderData);
        throw new Error(orderData.message || 'Order initiation failed.');
      }

      if (orderData.free) {
        router.push(`/order-success?productId=${product._id}`);
        return;
      }


      // Real Mode (Razorpay)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(product.calculatedTotal * 100),
        currency: product.selectedCurrency,
        name: "DigiExpo",
        description: `Purchase: ${product.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          const vRes = await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(response)
          });
          if (vRes.ok) router.push(`/order-success?productId=${product._id}`);
          else setError("Payment verification failed.");
        },
        prefill: {
          name: guestInfo.name,
          email: guestInfo.email
        },
        theme: { color: "#7c3aed" }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        try {
          await fetch(`${API_URL}/payments/fail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              order_id: response.error.metadata.order_id, 
              error_description: response.error.description 
            })
          });
        } catch(e) {}
        setError(response.error.description || "Payment failed");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleStandardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) executePayment(token);
  };

  const currencySymbol = product.selectedCurrency === 'USD' ? '$' : '₹';
  const formatAmount = (amt: number) => {
    return product.selectedCurrency === 'USD' ? amt.toFixed(2) : amt;
  };

  return (
    <div className={styles.paymentForm}>
      <h2 className={styles.formTitle}>
        {isLoggedIn ? `Payment Method (${product.selectedCurrency})` : 'Secure Billing Details'}
      </h2>

      {!isLoggedIn && (
        <div className={styles.guestFields}>
            <>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Set Account Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={guestInfo.password}
                  onChange={(e) => setGuestInfo({ ...guestInfo, password: e.target.value })}
                  required 
                />
              </div>
            </>
        </div>
      )}

      <div className={styles.trustBadges}>
        <div className={styles.badge}><ShieldCheck size={18} /> PCI Secured</div>
        <div className={styles.badge}><Lock size={18} /> SSL Encrypted</div>
      </div>

      <form className={styles.form} onSubmit={isLoggedIn ? handleStandardPayment : (e) => e.preventDefault()}>
        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        {!isLoggedIn ? (
          <button type="button" onClick={initiateGuestVerify} disabled={isProcessing} className={styles.payBtn}>
            {isProcessing ? 'Creating Account...' : (product.calculatedTotal === 0 ? 'Create Account & Get for Free' : `Continue to Pay ${currencySymbol}${formatAmount(product.calculatedTotal)}`)}
          </button>
        ) : (
          <button type="submit" disabled={isProcessing} className={styles.payBtn}>
            {isProcessing ? 'Processing...' : (product.calculatedTotal === 0 ? 'Get for Free' : `Pay ${currencySymbol}${formatAmount(product.calculatedTotal)}`)}
          </button>
        )}

        <p className={styles.guarantee}>
          <ShieldCheck size={16} />
          Encrypted checkout by Razorpay.
        </p>
      </form>
    </div>
  );
}
