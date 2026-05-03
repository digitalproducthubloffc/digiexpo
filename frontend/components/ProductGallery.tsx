'use client';

import { useState } from 'react';
import styles from './ProductGallery.module.css';

interface Props {
  thumbnail: string;
  gallery: string[];
  title: string;
}

export default function ProductGallery({ thumbnail, gallery, title }: Props) {
  // Build full image list: thumbnail first, then gallery images
  const allImages = [thumbnail, ...gallery.filter(img => img && img !== thumbnail)];
  const [active, setActive] = useState(0);

  return (
    <div className={styles.galleryWrapper}>
      {/* Main Display Image */}
      <div className={styles.mainDisplay}>
        <img src={allImages[active]} alt={title} className={styles.mainImg} />
        <div className={styles.badge}>DIGITAL EDITION 2024</div>
        {allImages.length > 1 && (
          <div className={styles.counter}>{active + 1} / {allImages.length}</div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className={styles.thumbStrip}>
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt={`View ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
