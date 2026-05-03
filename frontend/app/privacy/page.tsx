import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './legal.module.css';

export default function PrivacyPage() {
  return (
    <main className={styles.legalWrapper}>
      <Navbar />
      
      <div className={`${styles.content} container`}>
        <header className={styles.header}>
          <h1>Privacy Policy</h1>
          <p>Last updated: May 1, 2026</p>
        </header>

        <section className={styles.body}>
          <h2>1. Information We Collect</h2>
          <p>At Digital Product Hub, we collect information that you provide directly to us when you create an account, make a purchase, or contact our support team. This may include your name, email address, and payment history.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you about your account and purchases.</p>

          <h2>3. Data Protection</h2>
          <p>We implement industry-standard security measures to protect your personal data. Digital downloads are secured, and financial transactions are handled through encrypted gateways like Razorpay.</p>

          <h2>4. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time through your user dashboard.</p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
