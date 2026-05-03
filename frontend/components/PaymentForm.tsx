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
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
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
      setError('Please provide your name, email, and a password to receive the code.');
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
      
      setShowOtpField(true);
      setSuccess('Verification code sent to your inbox!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resendOtp = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestInfo.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('A fresh verification code has been sent!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');
    try {
      // 1. Verify OTP via POST (fixes @ symbol URL breaking issue)
      const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestInfo.email, otp })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message);

      // 2. Save session token
      localStorage.setItem('token', verifyData.token);
      setIsLoggedIn(true);
      
      // 3. Show status before opening payment gateway
      setSuccess('Account verified! Proceeding to payment gateway...');
      
      // 4. Short delay so user sees the message, then trigger payment
      setTimeout(() => {
        executePayment(verifyData.token);
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
          amount: product.realPrice,
          currency: 'USD'
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Order initiation failed.');

      if (orderData.free) {
        router.push(`/order-success?productId=${product._id}`);
        return;
      }

      // Simulation Mode
      if (orderData.id.startsWith('mock_order_')) {
        const verifyRes = await fetch(`${API_URL}/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: "fake_pay_id_123",
            razorpay_signature: "fake_signature"
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok || verifyData.success) {
           setSuccess("Purchase successful! Redirecting to your dashboard...");
           setTimeout(() => {
             router.push(`/order-success?productId=${product._id}`);
           }, 1500);
        } else {
          setError(verifyData.message || "Fulfillment failed. Please check your dashboard.");
          setIsProcessing(false);
        }
        return;
      }

      // Real Mode (Razorpay)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(product.realPrice * 100),
        currency: "USD",
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

  return (
    <div className={styles.paymentForm}>
      <h2 className={styles.formTitle}>
        {isLoggedIn ? 'Payment Method (USD)' : showOtpField ? 'Confirm Your Identity' : 'Secure Billing Details'}
      </h2>

      {!isLoggedIn && (
        <div className={styles.guestFields}>
          {!showOtpField ? (
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
          ) : (
            <div className={styles.otpSection}>
              <div className={styles.otpIcon}><Mail size={32} /></div>
              <p>We've sent a 6-digit verification code to <strong>{guestInfo.email}</strong>. Enter it below to secure your account and proceed.</p>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="123456" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={styles.otpInput}
                  autoFocus
                />
              </div>
              <div className={styles.otpActions}>
                <button type="button" onClick={() => setShowOtpField(false)} className={styles.changeEmailBtn}>Change Email</button>
                <button type="button" onClick={resendOtp} disabled={isProcessing} className={styles.resendBtn}>Resend Code</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.trustBadges}>
        <div className={styles.badge}><ShieldCheck size={18} /> PCI Secured</div>
        <div className={styles.badge}><Lock size={18} /> SSL Encrypted</div>
      </div>

      <form className={styles.form} onSubmit={showOtpField ? handleVerifyAndPay : isLoggedIn ? handleStandardPayment : (e) => e.preventDefault()}>
        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        {!isLoggedIn && !showOtpField ? (
          <button type="button" onClick={initiateGuestVerify} disabled={isProcessing} className={styles.payBtn}>
            {isProcessing ? 'Creating Account...' : 'Continue to Verification'}
          </button>
        ) : (
          <button type="submit" disabled={isProcessing} className={styles.payBtn}>
            {isProcessing ? 'Processing...' : `Verify & Pay $${product.realPrice?.toFixed(2)}`}
          </button>
        )}

        <p className={styles.guarantee}>
          <ShieldCheck size={16} />
          Encrypted checkout by DigiExpo.
        </p>
      </form>
    </div>
  );
}
