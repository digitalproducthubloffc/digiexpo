'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';
import WishlistButton from '@/components/WishlistButton';
import BuyNowButton from '@/components/BuyNowButton';
import ProductChatSection from '@/components/ProductChatSection';
import { Check, Star, FileText, HardDrive, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import FormattedDescription from '@/components/FormattedDescription';
import styles from '../[id]/product.module.css';

export default function PreviewPage() {
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('digiexpo_product_preview');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setProduct({
          ...parsed,
          _id: 'preview',
          rating: 5,
          numReviews: 0,
          images: [],
          title: parsed.title || 'Product Title',
          description: parsed.description || 'Product description will appear here.',
          category: parsed.category || 'Category',
          realPrice: parsed.isFree ? 0 : Number(parsed.realPrice) || 0,
          originalPrice: parsed.isFree ? 0 : Number(parsed.originalPrice) || 0,
          fileType: 'Digital',
          fileSize: 'Format',
          details: [],
          tags: []
        });
      } catch (e) {
        console.error("Failed to parse preview data");
      }
    }
  }, []);

  if (!product) {
    return (
      <main className={styles.mainWrapper}>
        <Navbar />
        <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
          Loading preview... If nothing appears, go back and click Live Preview again.
        </div>
        <Footer />
      </main>
    );
  }

  const galleryImages = product.images && product.images.length > 0 ? product.images : [];

  return (
    <main className={styles.mainWrapper}>
      <Navbar />
      
      {/* Banner indicating this is a preview */}
      <div style={{ background: '#f59e0b', color: 'white', textAlign: 'center', padding: '10px', fontWeight: 600 }}>
        This is a Live Preview. Buying and interacting are disabled.
      </div>
      
      <div className={`${styles.productContainer} container`}>
        <div className={styles.breadcrumb}>
           <Link href="#">Home</Link> / <Link href="#">{product.category}</Link> / <span>{product.title}</span>
        </div>

        <div className={styles.productHero}>
          {/* Left: Interactive Gallery */}
          <div className={styles.visuals} style={{ position: 'relative' }}>
            <ProductGallery 
              thumbnail={product.image} 
              gallery={galleryImages} 
              title={product.title} 
            />
          </div>

          {/* Right: Product Info */}
          <div className={styles.details}>
            <h1 className={styles.title}>{product.title}</h1>
            
            <div className={styles.ratingBox}>
               <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={16} fill="#eab308" color="#eab308" />
                  ))}
               </div>
               <span>5.0 (0 reviews)</span>
            </div>

            <div className={styles.priceBox}>
               <div className={styles.priceRow} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 {product.realPrice === 0 ? (
                   <span className={styles.price} style={{ color: '#10b981' }}>Free</span>
                 ) : (
                   <span className={styles.price}>${product.realPrice.toFixed(2)}</span>
                 )}
                 {product.originalPrice > product.realPrice && product.realPrice > 0 && (
                   <>
                     <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                     <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                       {Math.round(((product.originalPrice - product.realPrice) / product.originalPrice) * 100)}% OFF
                     </span>
                   </>
                 )}
               </div>
               <div className={styles.metaRow}>
                 <div className={styles.metaItem}>
                   <FileText size={14} />
                   <span>{product.fileType} Format</span>
                 </div>
                 <div className={styles.metaItem}>
                   <HardDrive size={14} />
                   <span>{product.fileSize}</span>
                 </div>
                 <div className={styles.metaItem}>
                   <Download size={14} />
                   <span>Instant Download</span>
                 </div>
               </div>
            </div>

            <div className={styles.actionButtons} style={{ pointerEvents: 'none', opacity: 0.8 }}>
               <BuyNowButton productId={product._id} price={product.realPrice} externalPurchaseLink="" />
               <WishlistButton productId={product._id} title={product.title} />
               <div id="product-chat">
                 <ProductChatSection productId={product._id} />
               </div>
            </div>

            <div className={styles.descriptionBox}>
               <h4>DESCRIPTION</h4>
               <FormattedDescription text={product.description} />
            </div>

            {/* Features / What's Inside */}
            {product.details && product.details.length > 0 && (
              <div className={styles.featuresBox}>
                <h4>WHAT'S INSIDE</h4>
                <ul className={styles.features}>
                  {product.details.map((d: string, i: number) => (
                    <li key={i}>
                       <Check size={16} color="#6366F1" strokeWidth={3} />
                       {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className={styles.tagsBox}>
                {product.tags.map((tag: string, i: number) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
