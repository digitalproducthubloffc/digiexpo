import { fetchProducts } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './catalog.module.css';

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ cat?: string, q?: string }> }) {
  let products = [];
  try {
    products = await fetchProducts();
  } catch (error) {
    console.error('API Error:', error);
  }
  
  const { cat, q } = await searchParams;

  const categories = ['Drawing Sheets', 'Digital Templates', 'Arch Plans'];
  
  let filteredProducts = products;

  if (cat) {
    filteredProducts = filteredProducts.filter((p: any) => p.category === cat);
  }

  if (q) {
    const searchLower = q.toLowerCase();
    filteredProducts = filteredProducts.filter((p: any) => 
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div className={styles.catalogWrapper}>
      <Navbar />
      
      <main className={`${styles.main} container`}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          {/* Categories section removed */}
        </aside>

        {/* Main Content */}
        <section className={styles.content}>
          <div className={styles.grid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p: any) => (
                <ProductCard key={p._id} {...p} />
              ))
            ) : (
              <p className={styles.noResults}>No resources found in this category.</p>
            )}
          </div>
          
          <div className={styles.pagination}>
            <button className={styles.loadMore} suppressHydrationWarning>Load Archive Page 2</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
