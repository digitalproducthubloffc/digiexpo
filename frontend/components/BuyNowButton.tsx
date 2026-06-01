'use client';

import styles from '../app/product/[id]/product.module.css';

interface Props {
  productId: string;
  price: number;
  externalPurchaseLink?: string;
}

export default function BuyNowButton({ productId, price, externalPurchaseLink }: Props) {

  const handleBuyNow = () => {
    if (externalPurchaseLink) {
      // Redirect to external platform (Gumroad, Payhip, etc.)
      window.open(externalPurchaseLink, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to internal checkout
      window.location.href = `/checkout?id=${productId}`;
    }
  };

  return (
    <button 
      onClick={handleBuyNow} 
      className={styles.buyBtn}
      style={{ cursor: 'pointer', border: 'none', width: '100%' }}
      suppressHydrationWarning
    >
      Buy Now — ${price.toFixed(2)}
    </button>
  );
}
