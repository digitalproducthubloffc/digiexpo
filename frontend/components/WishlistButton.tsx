'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface Props {
  productId: string;
  title: string;
}

export default function WishlistButton({ productId, title }: Props) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlisted(list.some((item: any) => item.id === productId));
  }, [productId]);

  const toggle = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlisted) {
      const updated = list.filter((item: any) => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setWishlisted(false);
    } else {
      list.push({ id: productId, title });
      localStorage.setItem('wishlist', JSON.stringify(list));
      setWishlisted(true);
    }
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      style={{
        backgroundColor: wishlisted ? '#f8f5ff' : 'white', /* Subtly purple background */
        color: wishlisted ? '#7c3aed' : '#0f172a', /* Pure logo purple text */
        padding: '1.1rem',
        borderRadius: '10px',
        fontWeight: 700,
        fontSize: '1.05rem',
        border: `1px solid ${wishlisted ? '#d8b4fe' : '#e2e8f0'}`, /* Pure logo tinted border */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        transition: 'all 0.2s',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <Heart size={20} fill={wishlisted ? '#7c3aed' : 'none'} />
      {wishlisted ? 'Wishlisted ✓' : 'Add to Wishlist'}
    </button>
  );
}
