'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { fetchProducts } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown, RotateCcw, LayoutGrid } from 'lucide-react';
import styles from './catalog.module.css';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');
  const [freeOnly, setFreeOnly] = useState(searchParams.get('free') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // UI States
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Available Categories (dynamic check or common list)
  const categories = [
    { name: 'All Assets', value: '' },
    { name: 'Drawing Sheets', value: 'Drawing Sheets' },
    { name: 'Digital Templates', value: 'Digital Templates' },
    { name: 'Arch Plans', value: 'Arch Plans' },
    { name: 'Notion Templates', value: 'Notion Templates' }
  ];

  // Available Product Types
  const productTypes = [
    { label: 'Drawings/Sketch', value: 'Drawings/Sketch' },
    { label: 'Notion Template', value: 'Notion Template' },
    { label: 'Website/Portfolio', value: 'Website/Portfolio' },
    { label: 'Other', value: 'Other' }
  ];

  // Fetch products from API based on current filter states
  const loadFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        category: category || undefined,
        search: search || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy: sortBy || undefined,
        type: type || undefined,
        freeOnly: freeOnly ? 'true' : undefined
      });
      setProducts(data);
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  }, [category, search, minPrice, maxPrice, sortBy, type, freeOnly]);

  // Sync URL searchParams when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('cat', category);
    if (type) params.set('type', type);
    if (minPrice) params.set('min', minPrice);
    if (maxPrice) params.set('max', maxPrice);
    if (freeOnly) params.set('free', 'true');
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

    loadFilteredProducts();
  }, [category, search, minPrice, maxPrice, sortBy, type, freeOnly, pathname, loadFilteredProducts]);

  // Sync query parameters from external navigation changes (e.g. Navbar search)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('cat') || '';
    if (q !== search) setSearch(q);
    if (cat !== category) setCategory(cat);
  }, [searchParams]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setFreeOnly(false);
    setSortBy('newest');
    setIsMobileDrawerOpen(false);
  };

  const hasActiveFilters = search || category || type || minPrice || maxPrice || freeOnly || sortBy !== 'newest';

  return (
    <div className={styles.catalogWrapper}>
      <Navbar />

      {/* Catalog Title Banner */}
      <header className={styles.bannerHeader}>
        <div className={`container ${styles.bannerInner}`}>
          <span className={styles.breadcrumb}>EXPLORE THE ARCHIVE</span>
          <h1 className={styles.title}>
            Premium <span>Digital Assets</span>
          </h1>
          <p className={styles.subtitle}>
            Explore and download drawings, CAD sheets, architectural templates, and digital assets.
          </p>
          <div className={styles.headerLine}></div>
        </div>
      </header>

      {/* Horizontal Categories Pills */}
      <section className={styles.categoryPillsSection}>
        <div className="container">
          <div className={styles.pillsScroll}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`${styles.pill} ${category === cat.value ? styles.activePill : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className={`${styles.main} container`}>
        {/* Sidebar (Desktop Filters) */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button className={styles.clearBtn} onClick={handleClearFilters}>
                  <RotateCcw size={14} /> Clear
                </button>
              )}
            </div>

            {/* Live Search */}
            <div className={styles.filterGroup}>
              <label className={styles.groupLabel}>Keyword Search</label>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className={styles.searchClear} onClick={() => setSearch('')}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Product Type Selection */}
            <div className={styles.filterGroup}>
              <label className={styles.groupLabel}>Resource Type</label>
              <div className={styles.typeSelector}>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={styles.select}
                >
                  <option value="">All Types</option>
                  {productTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range Filters */}
            <div className={styles.filterGroup}>
              <label className={styles.groupLabel}>Price Range (USD)</label>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className={styles.priceInput}
                />
                <span className={styles.priceRangeSeparator}>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </div>

            {/* Free Toggle */}
            <div className={styles.filterGroup}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                />
                <span>Free Resources Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className={styles.content}>
          {/* Top Control Bar */}
          <div className={styles.controlsBar}>
            <div className={styles.resultsInfo}>
              <LayoutGrid size={18} className={styles.resultIcon} />
              <span>{loading ? 'Searching...' : `${products.length} assets found`}</span>
            </div>

            {/* Action Bar controls */}
            <div className={styles.actionsRow}>
              {/* Sort Selector */}
              <div className={styles.sortWrapper}>
                <span className={styles.sortLabel}>Sort By</span>
                <div className={styles.selectWrapper}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.sortSelect}
                  >
                    <option value="newest">Newest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown size={14} className={styles.dropdownArrow} />
                </div>
              </div>

              {/* Mobile Filter Button */}
              <button
                className={styles.mobileFilterBtn}
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className={styles.grid}>
            {loading ? (
              // Beautiful Skeleton Loader
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonLineShort}></div>
                    <div className={styles.skeletonLineLong}></div>
                    <div className={styles.skeletonFooter}>
                      <div className={styles.skeletonCircle}></div>
                      <div className={styles.skeletonLineShort}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((p: any) => <ProductCard key={p._id} {...p} />)
            ) : (
              <div className={styles.noResultsCard}>
                <div className={styles.noResultsIllustration}>🔍</div>
                <h3>No resources found</h3>
                <p>Try modifying your search query or expanding the selected filters.</p>
                {hasActiveFilters && (
                  <button className={styles.resetBtn} onClick={handleClearFilters}>
                    Reset All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Mobile Drawer (Filters Panel Slideout) */}
      {isMobileDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsMobileDrawerOpen(false)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>Filters</h3>
              <button className={styles.closeBtn} onClick={() => setIsMobileDrawerOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Keyword Search */}
              <div className={styles.drawerFilterGroup}>
                <label className={styles.groupLabel}>Keyword Search</label>
                <div className={styles.searchBox}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Product Type Selection */}
              <div className={styles.drawerFilterGroup}>
                <label className={styles.groupLabel}>Resource Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={styles.select}
                >
                  <option value="">All Types</option>
                  {productTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filters */}
              <div className={styles.drawerFilterGroup}>
                <label className={styles.groupLabel}>Price Range (USD)</label>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={styles.priceInput}
                  />
                  <span className={styles.priceRangeSeparator}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={styles.priceInput}
                  />
                </div>
              </div>

              {/* Free Toggle */}
              <div className={styles.drawerFilterGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                  />
                  <span>Free Resources Only</span>
                </label>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button
                className={styles.applyBtn}
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button className={styles.resetBtn} onClick={handleClearFilters}>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <main>
        <Navbar />
        <div style={{ padding: '150px 0', textAlign: 'center' }}>Loading catalog...</div>
        <Footer />
      </main>
    }>
      <CatalogContent />
    </Suspense>
  );
}
