import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import WishlistButton from '@/components/WishlistButton';
import ProductReviews from '@/components/ProductReviews';
import RecentViewTracker from '@/components/RecentViewTracker';
import { fetchProductById, fetchProducts } from '@/lib/api';
import { Check, Star, FileText, HardDrive, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import BuyNowButton from '@/components/BuyNowButton';
import ProductChatSection from '@/components/ProductChatSection';
import FormattedDescription from '@/components/FormattedDescription';
import styles from './product.module.css';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: any;
  let allProducts: any[] = [];
  
  try {
    product = await fetchProductById(id);
    allProducts = await fetchProducts();
  } catch (error) {
    return <div className="container" style={{padding: '100px 0'}}>Product not found.</div>;
  }

  // Related Products: same category first, fallback to any others
  let related = allProducts.filter(p => p.category === product.category && p._id !== product._id);
  if (related.length === 0) {
    related = allProducts.filter(p => p._id !== product._id).slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  // Build gallery from thumbnail + images array
  const galleryImages = product.images && product.images.length > 0 ? product.images : [];

  return (
    <main className={styles.mainWrapper}>
      <Navbar />
      <RecentViewTracker product={product} />
      
      <div className={`${styles.productContainer} container`}>
        <div className={styles.breadcrumb}>
           <Link href="/">Home</Link> / <Link href="/catalog">{product.category}</Link> / <span>{product.title}</span>
        </div>

        <div className={styles.productHero}>
          {/* Left: Interactive Gallery */}
          <div className={styles.visuals}>
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
                    <Star key={i} size={16} fill={i <= (product.rating || 0) ? "#eab308" : "none"} color={i <= (product.rating || 0) ? "#eab308" : "#cbd5e1"} />
                  ))}
               </div>
               <span>{product.rating ? product.rating.toFixed(1) : "0.0"} ({product.numReviews || 0} reviews)</span>
            </div>

            <div className={styles.priceBox}>
               <div className={styles.priceRow}>
                 <span className={styles.price}>${product.realPrice?.toFixed(2)}</span>
                 {product.originalPrice > product.realPrice && (
                   <span className={styles.originalPrice}>${product.originalPrice?.toFixed(2)}</span>
                 )}
               </div>
               <div className={styles.metaRow}>
                 <div className={styles.metaItem}>
                   <FileText size={14} />
                   <span>{product.fileType || 'PDF'} Format</span>
                 </div>
                 <div className={styles.metaItem}>
                   <HardDrive size={14} />
                   <span>{product.fileSize || 'Digital'}</span>
                 </div>
                 <div className={styles.metaItem}>
                   <Download size={14} />
                   <span>Instant Download</span>
                 </div>
               </div>
            </div>

            <div className={styles.actionButtons}>
               <BuyNowButton productId={product._id} price={product.realPrice} externalPurchaseLink={product.externalPurchaseLink} />
               <WishlistButton productId={product._id} title={product.title} />
               {product.websiteLink && (
                 <a href={product.websiteLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s', marginTop: '10px' }}>
                   <ExternalLink size={18} /> Live Preview
                 </a>
               )}
               <ProductChatSection productId={product._id} />
            </div>

            {product.customizationAvailable && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '12px', color: '#7c3aed', fontWeight: '600', marginTop: '20px', fontSize: '0.9rem' }}>
                 ✨ Customization Available upon Request
              </div>
            )}

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

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
             <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sub}>CURATED ARCHIVE</span>
                  <h2>Related Products</h2>
                </div>
                <Link href="/catalog" className={styles.viewAll}>View Full Archive →</Link>
             </div>

             <div className={styles.relatedGrid}>
                {related.map(p => (
                   <ProductCard key={p._id} {...p} />
                ))}
             </div>
          </section>
        )}

        {/* Dynamic User Reviews Section */}
        <ProductReviews productId={product._id} initialReviews={product.reviews || []} />

      </div>

      <Footer />
    </main>
  );
}
