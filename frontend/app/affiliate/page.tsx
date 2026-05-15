import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, TrendingUp, Users, Wallet, Percent, ShieldCheck, Zap } from 'lucide-react';
import styles from './affiliate.module.css';

export default function AffiliatePage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      {/* Background aesthetic blobs */}
      <div className={styles.bgBlobLeft}></div>
      <div className={styles.bgBlobRight}></div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.badge}>PARTNER PROGRAM</div>
        <h1 className={styles.title}>
          Turn Your Audience <br /> Into <span className={styles.italicAccent}>Revenue</span>
        </h1>
        <p className={styles.description}>
          Join the Digital Productsy Affiliate Program and earn industry-leading commissions 
          by promoting premium architectural and digital assets.
        </p>
        <Link href="/affiliate/apply" className={styles.primaryBtn}>
          Start Earning Today
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.grid}>
          {/* Feature 1 */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Percent size={32} />
            </div>
            <h3 className={styles.cardTitle}>Up to 20-30% Commission</h3>
            <p className={styles.cardDesc}>
              Earn one of the highest payout rates in the digital asset space for every successful sale you refer.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <TrendingUp size={32} />
            </div>
            <h3 className={styles.cardTitle}>30-Day Cookie Life</h3>
            <p className={styles.cardDesc}>
              Your referred traffic is tracked for 30 days. If they purchase anytime within that window, you get paid.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Zap size={32} />
            </div>
            <h3 className={styles.cardTitle}>High Conversions</h3>
            <p className={styles.cardDesc}>
              Our premium platform and high-quality assets ensure a high conversion rate, maximizing your earning potential.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Wallet size={32} />
            </div>
            <h3 className={styles.cardTitle}>Instant Payouts</h3>
            <p className={styles.cardDesc}>
              Get paid swiftly and securely via Razorpay, PayPal, or Wire Transfer with no hidden fees.
            </p>
          </div>

          {/* Feature 5 */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <ShieldCheck size={32} />
            </div>
            <h3 className={styles.cardTitle}>Transparent Tracking</h3>
            <p className={styles.cardDesc}>
              Access a dedicated affiliate dashboard to monitor your clicks, conversions, and revenue in real-time.
            </p>
          </div>

          {/* Feature 6 */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Users size={32} />
            </div>
            <h3 className={styles.cardTitle}>Dedicated Support</h3>
            <p className={styles.cardDesc}>
              Get exclusive access to promotional materials, banners, and 1-on-1 support from our partnership team.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Ready to multiply your income?</h2>
          <p>Sign up now and get instant access to your affiliate links and promotional materials.</p>
          <Link href="/affiliate/apply" className={styles.primaryBtn}>
            Join the Affiliate Program
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
