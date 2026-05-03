import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Script from 'next/script';
import { fetchProductById } from '@/lib/api';
import PaymentForm from '@/components/PaymentForm';
import { ShieldCheck, Lock, CreditCard, Download } from 'lucide-react';
import styles from './checkout.module.css';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <main>
        <Navbar />
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2>No product selected</h2>
          <p>Please select a product to checkout.</p>
        </div>
        <Footer />
      </main>
    );
  }

  let product: any;
  try {
    product = await fetchProductById(id);
  } catch {
    return (
      <main>
        <Navbar />
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2>Product not found</h2>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className={`${styles.checkoutPage} container`}>
        <h1 className={styles.pageTitle}>Checkout Hub</h1>

        <div className={styles.layout}>
          {/* Left: Order Summary */}
          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>

            <div className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={product.image} alt={product.title} />
              </div>
              <div className={styles.productInfo}>
                <span className={styles.category}>{product.category}</span>
                <h3>{product.title}</h3>
                <p className={styles.desc}>{product.description?.substring(0, 120)}...</p>
                <div className={styles.meta}>
                  <span>{product.fileType || 'PDF'}</span>
                  <span>•</span>
                  <span>{product.fileSize || 'Digital'}</span>
                  <span>•</span>
                  <span>Instant Download</span>
                </div>
              </div>
            </div>

            {/* Gallery preview */}
            {product.images && product.images.length > 0 && (
              <div className={styles.galleryPreview}>
                <p className={styles.galleryLabel}>Included Files Preview</p>
                <div className={styles.galleryRow}>
                  <div className={styles.galleryThumb}>
                    <img src={product.image} alt="Thumbnail" />
                  </div>
                  {product.images.slice(0, 3).map((img: string, i: number) => (
                    <div key={i} className={styles.galleryThumb}>
                      <img src={img} alt={`Preview ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.details && product.details.length > 0 && (
              <div className={styles.featuresList}>
                <p className={styles.galleryLabel}>What You'll Get</p>
                <ul>
                  {product.details.map((d: string, i: number) => (
                    <li key={i}>
                      <Download size={14} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>${product.originalPrice?.toFixed(2)}</span>
              </div>
              {product.originalPrice > product.realPrice && (
                <div className={`${styles.priceRow} ${styles.discount}`}>
                  <span>Discount</span>
                  <span>-${(product.originalPrice - product.realPrice).toFixed(2)}</span>
                </div>
              )}
              <div className={styles.priceRow}>
                <span>Platform Fee (2%)</span>
                <span>${(product.realPrice * 0.02).toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>GST (18%)</span>
                <span>${(product.realPrice * 0.18).toFixed(2)}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total</span>
                <span>${(product.realPrice + (product.realPrice * 0.20)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className={styles.paymentColumn}>
            <PaymentForm product={{
              ...product,
              realPrice: (product.realPrice + (product.realPrice * 0.20)) // Final amount after tax + fee
            }} />
            
            <div className={styles.refundNotice}>
              <ShieldCheck size={16} />
              <p><strong>Digital Product Notice:</strong> Due to the nature of digital assets, this product is non-refundable. Once purchased, you will receive permanent access to the files.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
