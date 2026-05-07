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
           <p>If your download didn't start automatically:</p>
           <a href={product?.fileUrl || '#'} download target="_blank" className={styles.downloadBtn}>
             <Download size={20} />
             Download File Now
           </a>
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
