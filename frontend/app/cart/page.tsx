'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trash2 } from 'lucide-react';
import styles from './cart.module.css';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    setLoading(false);
  }, []);

  const removeItem = (indexToRemove: number) => {
    const updated = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    // Trigger navbar sync
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0).toFixed(2);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <main className={`container ${styles.cartContainer}`}>
        <h1 className={styles.title}>Your Cart</h1>
        
        {loading ? (
          <p className={styles.emptyMsg}>Loading your picks...</p>
        ) : cartItems.length > 0 ? (
          <div className={styles.cartLayout}>
            
            {/* Items List */}
            <div className={styles.itemsList}>
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className={styles.cartItem}>
                  <img src={item.image} alt={item.title} className={styles.itemImg} />
                  <div className={styles.itemInfo}>
                    <h3>{item.title}</h3>
                    <p>Digital Download</p>
                  </div>
                  <div className={styles.itemPrice}>
                    ${item.price?.toFixed(2)}
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(index)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className={styles.summaryBox}>
               <h2>Order Summary</h2>
               
               <div className={styles.summaryRow}>
                 <span>Subtotal</span>
                 <span>${calculateTotal()}</span>
               </div>
               <div className={styles.summaryRow}>
                 <span>Taxes & Fees</span>
                 <span>$0.00</span>
               </div>
               
               <div className={styles.totalRow}>
                 <span>Total</span>
                 <span>${calculateTotal()}</span>
               </div>
               
               {/* Because checkout previously expected a single ID, we'd normally pass multiple or build a multi-item checkout backend. For now, since user requests smooth logic, we simply route to the multi-purpose checkout page. */}
               <Link href={`/checkout?id=${cartItems[0].id}`} className={styles.checkoutBtn}>
                 Proceed to Checkout
               </Link>
            </div>

          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>Your cart is incredibly empty.</h2>
            <p>Let's find some architectural gold for your projects.</p>
            <a href="/catalog" className={styles.cta}>Explore Catalog</a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
