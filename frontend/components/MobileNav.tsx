'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setCartCount(cart.length);
      setWishlistCount(wishlist.length);
    };

    updateCounts();
    
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);

    return () => {
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, []);

  return (
    <nav className={styles.mobileNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>
      <Link href="/catalog" className={`${styles.navItem} ${pathname === '/catalog' ? styles.active : ''}`}>
        <LayoutGrid size={20} />
        <span>Browse</span>
      </Link>
      <Link href="/wishlist" className={`${styles.navItem} ${pathname === '/wishlist' ? styles.active : ''}`}>
        <div className={styles.iconWrapper}>
          <Heart size={20} />
          {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </Link>
      <Link href="/cart" className={`${styles.navItem} ${pathname === '/cart' ? styles.active : ''}`}>
        <div className={styles.iconWrapper}>
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </div>
        <span>Cart</span>
      </Link>
      <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
        <User size={20} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
