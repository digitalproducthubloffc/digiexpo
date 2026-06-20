'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductProps {
  _id: string;
  title: string;
  category: string;
  image: string;
  originalPrice: number;
  realPrice: number;
  description?: string;
  isNew?: boolean;
}

export default function ProductCard({ _id, title, category, image, originalPrice, realPrice, description, isNew }: ProductProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlisted(list.some((item: any) => item.id === _id));
  }, [_id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlisted) {
      const updated = list.filter((item: any) => item.id !== _id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setWishlisted(false);
    } else {
      list.push({ id: _id, title });
      localStorage.setItem('wishlist', JSON.stringify(list));
      setWishlisted(true);
    }
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ id: _id, title, price: realPrice, image });
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch event to navbar
    window.dispatchEvent(new Event('cartUpdated'));

    // Temporary button feedback
    const btn = e.currentTarget as HTMLButtonElement;
    const oldText = btn.innerHTML;
    btn.innerHTML = `<span style="font-size:0.8rem">Added ✓</span>`;
    btn.style.backgroundColor = '#22c55e';
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.backgroundColor = '#0f172a'; // Match aesthetic dark color
    }, 1500);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link href={`/product/${_id}`} className={styles.imageLink}>
          <img src={image} alt={title} className={styles.productImage} />
        </Link>
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5 }}>
          {isNew && <span className={styles.newBadge}>NEW</span>}
          {originalPrice > realPrice && (
            <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>
              {Math.round(((originalPrice - realPrice) / originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
        
        {/* Hover Heart Action - Only render on client to avoid hydration issues */}
        {isMounted && (
          <button 
            className={`${styles.hoverHeartBtn} ${wishlisted ? styles.wishlistedActive : ''}`}
            onClick={toggleWishlist}
            aria-label="Toggle Wishlist"
            suppressHydrationWarning
          >
            <Heart size={20} fill={wishlisted ? "#7c3aed" : "none"} color={wishlisted ? "#7c3aed" : "#cbd5e1"} strokeWidth={2.5} />
          </button>
        )}
      </div>
      
      <div className={styles.content}>
        <span className={styles.categoryTag}>{category?.toUpperCase()}</span>
        <Link href={`/product/${_id}`}>
          <h3 className={styles.title}>{title}</h3>
        </Link>
        <p className={styles.description}>
          {description || "Standard operating procedures for scaling high-end luxury brand identities."}
        </p>
        
        <div className={styles.footer}>
          {realPrice === 0 ? (
            <span className={styles.price} style={{ color: '#10b981', fontWeight: 800 }}>Free</span>
          ) : (
            <span className={styles.price}>${realPrice ? realPrice.toFixed(2) : '0.00'}</span>
          )}
          {isMounted && (
            <button className={styles.addBtn} onClick={addToCart} suppressHydrationWarning>
              <ShoppingCart size={16} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
