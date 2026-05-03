'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Heart, User, ShoppingCart, Menu, X, LayoutGrid, BookOpenText, Headset } from 'lucide-react';
import { fetchProducts } from '@/lib/api';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    fetchProducts().then(setAllProducts).catch(console.error);

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    const updateWishlist = () => {
      const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(list.length);
    };

    updateCart();
    updateWishlist();

    window.addEventListener('cartUpdated', updateCart);
    window.addEventListener('wishlistUpdated', updateWishlist);

    // Close suggestions on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('cartUpdated', updateCart);
      window.removeEventListener('wishlistUpdated', updateWishlist);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const matches = allProducts.filter(p => 
        p.title.toLowerCase().includes(val.toLowerCase()) || 
        p.category?.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setFilteredProducts(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.container} container-fluid`}>
        {/* Left: Logo Only */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>Digital Product Hub</Link>
        </div>

        {/* Center/Right: Search with Suggestions */}
        <div className={styles.centerRightSection}>
          <div className={styles.searchWrapper} ref={searchRef}>
            <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search premium drawings, plans, assets..." 
                value={query}
                onChange={handleSearchChange}
                onFocus={() => query.trim().length > 1 && setShowSuggestions(true)}
                suppressHydrationWarning
              />
            </form>

            {showSuggestions && filteredProducts.length > 0 && (
              <div className={styles.suggestions}>
                {filteredProducts.map((p) => (
                  <Link 
                    key={p._id} 
                    href={`/product/${p._id}`}
                    className={styles.suggestionItem}
                    onClick={() => setShowSuggestions(false)}
                  >
                    <img src={p.image} alt="" className={styles.suggestImg} />
                    <div className={styles.suggestInfo}>
                      <span className={styles.suggestTitle}>{p.title}</span>
                      <span className={styles.suggestPrice}>${p.realPrice}</span>
                    </div>
                  </Link>
                ))}
                <Link href={`/catalog?q=${query}`} className={styles.viewAllResults}>
                  View all results for "{query}"
                </Link>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Link href="/blog" className={styles.iconBtn} aria-label="Read Blog">
              <BookOpenText size={22} />
            </Link>

            <Link href="/catalog" className={styles.iconBtn} aria-label="Browse Catalog">
              <LayoutGrid size={22} />
            </Link>

            <Link href={isLoggedIn ? "/wishlist" : "/login"} className={styles.iconBtn} aria-label="Wishlist">
              <Heart size={22} />
              {isMounted && isLoggedIn && wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
            
            <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
              <ShoppingCart size={22} />
              {isMounted && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>

            {isMounted && isLoggedIn ? (
              <div className={styles.userMenu}>
                <Link href="/dashboard" className={styles.avatar}>
                  <User size={20} />
                </Link>
                <div className={styles.userDropdown}>
                  <Link href="/dashboard">My Dashboard</Link>
                  <button onClick={() => { 
                    localStorage.removeItem('token'); 
                    localStorage.removeItem('cart');
                    localStorage.removeItem('wishlist');
                    window.location.href = '/'; 
                  }} className={styles.logoutLink}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.loginLink}>LOGIN</Link>
                <Link href="/signup" className={styles.signUpBtn}>SIGN IN</Link>
              </div>
            )}

            <Link href="/support" className={styles.helpBtn} aria-label="Help Desk">
              <Headset size={22} />
            </Link>
          </div>

          <form className={styles.mobileSearchBar} onSubmit={handleSearchSubmit}>
            <Search size={16} className={styles.mobileSearchIcon} />
            <input
              type="text"
              placeholder="Search assets..."
              value={query}
              onChange={handleSearchChange}
              suppressHydrationWarning
            />
          </form>

          <div className={styles.mobileIcons}>
            <Link href="/blog" className={styles.mobileIconBtn} aria-label="Blog">
              <BookOpenText size={20} />
            </Link>
            <Link href="/support" className={styles.mobileIconBtn} aria-label="Support">
              <Headset size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Search Focused */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileSearch}>
           <form onSubmit={handleSearchSubmit}>
             <input 
               type="text" 
               placeholder="Search assets..." 
               value={query} 
               onChange={handleSearchChange}
             />
           </form>
        </div>
        
        <Link href={isLoggedIn ? "/wishlist" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>WISHLIST</Link>
        <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>MY CART</Link>

        {!isMounted || !isLoggedIn ? (
          <div className={styles.mobileAuth}>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>LOGIN</Link>
            <Link href="/signup" className={styles.signUpBtn} onClick={() => setIsMobileMenuOpen(false)}>SIGN IN</Link>
          </div>
        ) : (
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>MY ACCOUNT</Link>
        )}
      </div>
    </nav>
  );
}
