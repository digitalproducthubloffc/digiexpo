import Link from 'next/link';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import styles from './comingSoon.module.css';

export default function ComingSoonPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentCard}>
        <div className={styles.iconWrapper}>
          <Clock size={48} className={styles.icon} />
          <Sparkles size={24} className={styles.sparkleIcon} />
        </div>
        
        <h1 className={styles.title}>Coming Soon</h1>
        <p className={styles.description}>
          We are working hard to build a premium experience for our Affiliates and Sellers. 
          This feature will be unlocked very soon!
        </p>
        
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>
      
      {/* Background aesthetic blobs */}
      <div className={styles.bgBlobLeft}></div>
      <div className={styles.bgBlobRight}></div>
    </div>
  );
}
