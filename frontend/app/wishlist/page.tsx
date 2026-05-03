'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get IDs from local storage
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(list);

    // 2. Fetch all products and filter
    fetchProducts()
      .then((data) => {
        const ids = list.map((item: any) => item.id);
        setProducts(data.filter((p: any) => ids.includes(p._id)));
      })
      .catch((err) => console.error("Could not fetch products", err))
      .finally(() => setLoading(false));
  }, []); // Only runs on mount

  // Allow live removal handling locally without refresh
  useEffect(() => {
    const handleUpdate = () => {
       const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
       const ids = list.map((item: any) => item.id);
       fetchProducts().then(data => {
         setProducts(data.filter((p: any) => ids.includes(p._id)));
       });
    };
    window.addEventListener('wishlistUpdated', handleUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleUpdate);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <main className="container" style={{ minHeight: '60vh', padding: '4rem 1rem' }}>
        <h1 className={styles.title}>Your Wishlist</h1>
        
        {loading ? (
          <p className={styles.emptyMsg}>Loading wishlist aesthetics...</p>
        ) : products.length > 0 ? (
          <div className={styles.grid}>
            {products.map(p => (
              <ProductCard key={p._id} {...p} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>It's lonely here!</h2>
            <p>You haven't favored any products yet. Take a walk through our catalog.</p>
            <a href="/catalog" className={styles.cta}>Browse Collection</a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
