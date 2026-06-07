'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <h3>Digital Product Hub</h3>
            <p>Elevated digital experiences for modern creators. <br /> Find curated 3D models, architectural plans, and creative assets.</p>
          </div>
          
          <div className={styles.linkColumns}>
            <div className={styles.column}>
              <h4>Archive</h4>
              <Link href="/catalog">All Products</Link>
              <Link href="/blog">Our Insights</Link>
              <Link href="/support">Help Center</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
            <div className={styles.column}>
              <h4>Account</h4>
              {isLoggedIn ? (
                <Link href="/dashboard">My Dashboard</Link>
              ) : (
                <Link href="/login">Sign In</Link>
              )}
              <Link href="/signup">Create Account</Link>
              <Link href="/wishlist">Wishlist</Link>
            </div>
            <div className={styles.column}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy <ArrowUpRight size={12} /></Link>
              <Link href="/terms">Terms of Service <ArrowUpRight size={12} /></Link>
              <Link href="/refund">Refund Policy <ArrowUpRight size={12} /></Link>
              <Link href="/shipping">Shipping & Delivery <ArrowUpRight size={12} /></Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} Digital Product Hub. All rights reserved.</p>
          <div className={styles.socials}>
            <a href="https://x.com/itsislanoir" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">X / Twitter</a>
            <a href="https://www.instagram.com/digitalstore2236/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://www.threads.com/@digitalstore2236?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Threads">Threads</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
