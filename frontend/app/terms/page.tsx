import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './legal.module.css';

export default function TermsPage() {
  return (
    <main className={styles.legalWrapper}>
      <Navbar />
      
      <div className={`${styles.content} container`}>
        <header className={styles.header}>
          <h1>Terms of Service</h1>
          <p>Last updated: May 1, 2026</p>
        </header>

        <section className={styles.body}>
          <h2>1. Acceptable Use</h2>
          <p>By accessing Digital Product Hub, you agree to use our digital assets for their intended purposes and not to redistribute, resell, or claim ownership of any architectural or design files unless explicitly permitted by the license.</p>

          <h2>2. Digital Downloads</h2>
          <p>Upon successful payment, you are granted a non-exclusive, non-transferable right to download and use the purchased asset. Digital products are generally non-refundable once accessed.</p>

          <h2>3. Account Security</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

          <h2>4. Limitations of Liability</h2>
          <p>Digital Product Hub is not liable for any damages resulting from the use or inability to use our digital assets. Files are provided "as is" with the highest standard of architectural precision.</p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
