import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { fetchProducts } from '@/lib/api';
import styles from './page.module.css';

export default async function Home() {
  let products = [];
  try {
    products = await fetchProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <main>
      <Navbar />
      <Hero />
      
      <section className={styles.featured}>
        <div className="container">

          <div className={styles.productGrid}>
            {products.length > 0 ? (
              products.map((product: any) => (
                <ProductCard key={product._id} {...product} />
              ))
            ) : (
              <p className={styles.noProducts}>No products found. Please add some in the admin panel!</p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
