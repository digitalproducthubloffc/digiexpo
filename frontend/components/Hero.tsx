import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={`${styles.container} container`}>        
        <div className={styles.topBadge}>PREMIUM DIGITAL ARCHIVES</div>
        
        <h1 className={styles.headline}>
          Architectural <span className={styles.italicAccent}>Precision</span> <br />
          for Modern <br /> Creators.
        </h1>
        
        <p className={styles.subtitle}>
          Unlock a curated collection of high-end architectural plans, DXF drawings, <br />
          and 3D assets designed for professional excellence.
        </p>
        
        <div className={styles.buttonGroup}>
          <Link href="/catalog" className={styles.primaryBtn}>
            EXPLORE ARCHIVES
          </Link>
          <Link href="/catalog" className={styles.secondaryBtn}>
            VIEW LATEST
          </Link>
        </div>
      </div>
      
      {/* Background Gradient ORbs */}
      <div className={styles.bgBlobLeft}></div>
      <div className={styles.bgBlobRight}></div>
    </section>
  );
}
