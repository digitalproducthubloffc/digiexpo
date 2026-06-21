'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchSellerShop } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Globe, BadgeCheck } from 'lucide-react';

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

import styles from './shop.module.css';

export default function SellerShopPage() {
  const params = useParams();
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadShop() {
      try {
        const data = await fetchSellerShop(params.id as string);
        setShopData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load shop');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadShop();
  }, [params.id]);

  if (loading) {
    return (
      <main>
        <Navbar />
        <div style={{ padding: '150px 0', textAlign: 'center' }}>Loading shop...</div>
        <Footer />
      </main>
    );
  }

  if (error || !shopData) {
    return (
      <main>
        <Navbar />
        <div style={{ padding: '150px 0', textAlign: 'center', color: 'red' }}>{error || 'Shop not found'}</div>
        <Footer />
      </main>
    );
  }

  const { seller, products } = shopData;
  const { socialLinks } = seller;

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Banner Section */}
      <div className={styles.heroContainer}>
        <div 
          className={styles.banner} 
          style={{ backgroundImage: `url(${seller.bannerUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop'})` }}
        >
          {/* Social Links on the right side of the banner */}
          <div className={styles.socialOverlay}>
            {socialLinks?.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className={styles.socialIcon}><InstagramIcon size={20} /></a>
            )}
            {socialLinks?.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className={styles.socialIcon}><FacebookIcon size={20} /></a>
            )}
            {socialLinks?.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className={styles.socialIcon}><TwitterIcon size={20} /></a>
            )}
            {socialLinks?.website && (
              <a href={socialLinks.website} target="_blank" rel="noreferrer" className={styles.socialIcon}><Globe size={20} /></a>
            )}
          </div>
        </div>

        {/* Profile Info (DP overlapping banner) */}
        <div className={`container ${styles.profileInfoContainer}`}>
          <div className={styles.dpWrapper}>
            <img 
              src={seller.profileImage || 'https://via.placeholder.com/150'} 
              alt={seller.name} 
              className={styles.dp}
            />
          </div>
          <div className={styles.sellerDetails}>
            <h1 className={styles.sellerName}>
              {seller.name}
              {seller.verificationTier !== 'none' && <BadgeCheck className={styles.verifiedBadge} size={24} />}
            </h1>
            <p className={styles.joinedText}>Joined {new Date(seller.joinedDate).toLocaleDateString()}</p>
            {seller.bio && <p className={styles.bio}>{seller.bio}</p>}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={`container ${styles.productsContainer}`}>
        <h2 className={styles.sectionTitle}>Products by {seller.name}</h2>
        {products.length === 0 ? (
          <p className={styles.noProducts}>This seller hasn't published any products yet.</p>
        ) : (
          <div className={styles.grid}>
            {products.map((product: any) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
