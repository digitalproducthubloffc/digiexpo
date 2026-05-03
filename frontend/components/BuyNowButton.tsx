'use client';

import { useRouter } from 'next/navigation';
import styles from '../app/product/[id]/product.module.css';

interface Props {
  productId: string;
  price: number;
}

export default function BuyNowButton({ productId, price }: Props) {
  const router = useRouter();

  const handleBuyNow = () => {
    router.push(`/checkout?id=${productId}`);
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
