'use client';

import styles from '../app/product/[id]/product.module.css';

interface Props {
  productId: string;
  price: number;
  externalPurchaseLink?: string;
}

export default function BuyNowButton({ productId, price, externalPurchaseLink }: Props) {

  const handleBuyNow = () => {
    // Always route to our checkout flow to let user choose currency
    window.location.href = `/checkout?id=${productId}`;
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
