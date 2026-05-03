'use client';

import { useEffect } from 'react';

export default function RecentViewTracker({ product }: { product: any }) {
  useEffect(() => {
    if (!product || !product._id) return;

    try {
      const MAX_ITEMS = 6;
      let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      // Filter out this product if it already exists to avoid duplicates
      recent = recent.filter((r: any) => r._id !== product._id);
      
      // Add to front of array
      recent.unshift({
        _id: product._id,
        title: product.title,
        image: product.image,
        category: product.category,
        realPrice: product.realPrice
      });
      
      // Keep only most recent items
      if (recent.length > MAX_ITEMS) {
        recent = recent.slice(0, MAX_ITEMS);
      }
      
      localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    } catch (err) {
      console.error('Failed to save recently viewed:', err);
    }
  }, [product]);

  return null; // Hidden tracking component
}
