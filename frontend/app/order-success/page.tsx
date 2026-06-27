'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchProductById } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Download, CheckCircle, ArrowRight } from 'lucide-react';
import styles from './success.module.css';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        const prod = await fetchProductById(productId);
        setProduct(prod);
        
        // Auto Delivery Logic - Download the file instantly
        if (prod && prod.fileUrl) {
           setTimeout(() => {
             const anchor = document.createElement('a');
             anchor.href = prod.fileUrl;
             anchor.download = prod.fileUrl.split('/').pop() || 'download';
             anchor.target = "_blank";
             document.body.appendChild(anchor);
             anchor.click();
             document.body.removeChild(anchor);
           }, 1500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, router]);

  if (loading) {
    return (
       <div className={styles.loadingWrapper}>
         <div className={styles.spinner}></div>
         <p>Processing your digital assets...</p>
       </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.iconWrap}>
          <CheckCircle size={60} color="#10b981" />
          <div className={styles.sparkleOne}><Sparkles size={24} color="#fcd34d" /></div>
          <div className={styles.sparkleTwo}><Sparkles size={16} color="#7c3aed" /></div>
        </div>
        
        <h1>Payment Successful!</h1>
        <p className={styles.subtitle}>
          Your digital product has been unlocked and your download will begin automatically.
        </p>

        <div className={styles.productSnippet}>
          <img src={product?.image} alt="Product Cover" className={styles.productImg} />
          <div className={styles.productMeta}>
            <h3>{product?.title}</h3>
            <span>{product?.category} • {product?.fileType || 'PDF'}</span>
          </div>
        </div>

        <div className={styles.actionBlock}>
           {product?.fileUrl && (
             <>
               <p>If your download didn't start automatically:</p>
               <a href={product.fileUrl} download target="_blank" className={styles.downloadBtn}>
                 <Download size={20} />
                 Download File Now
               </a>
             </>
           )}

           {/* Post Purchase Content */}
           {product?.postPurchase && (product.postPurchase.headline || product.postPurchase.message || product.postPurchase.linkUrl || product.postPurchase.imageUrl) && (
             <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
               {product.postPurchase.headline && <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.5rem' }}>{product.postPurchase.headline}</h3>}
               {product.postPurchase.message && <p style={{ color: '#475569', marginBottom: '1rem', whiteSpace: 'pre-line' }}>{product.postPurchase.message}</p>}
               {product.postPurchase.imageUrl && (
                 <img src={product.postPurchase.imageUrl} alt="Post Purchase" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
               )}
               {product.postPurchase.linkUrl && (
                 <a href={product.postPurchase.linkUrl} target="_blank" rel="noreferrer" className={styles.downloadBtn} style={{ background: '#7c3aed', width: '100%', justifyContent: 'center' }}>
                   {product.postPurchase.linkText || 'Access Content'}
                 </a>
               )}
             </div>
           )}
        </div>

        <div className={styles.links}>
          <button onClick={() => router.push('/dashboard')} className={styles.dashBtn}>
            Go to Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className={styles.pageWrap}>
      <Navbar />
      <Suspense fallback={
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading your order details...</p>
        </div>
      }>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
