'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSellerAnalytics, addPaymentMethod, purchaseVerification, updateSellerProfile, fetchProducts, createProduct, BASE_URL, fetchAllChats, adminReplyChat, adminMarkChatRead } from '@/lib/api';
import { BarChart3, Settings, DollarSign, Package, MessageCircle, Link as LinkIcon, BadgeCheck, Upload, PlayCircle, Eye, Activity, Send, User, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import FollowModal from '@/components/FollowModal';
import styles from './sellerDashboard.module.css';

export default function SellerDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'products' | 'add_product' | 'payments' | 'verification' | 'chats' | 'affiliates' | 'settings'>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('all');

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [addProductStep, setAddProductStep] = useState(1);
  const [productForm, setProductForm] = useState({
    title: '', description: '', category: '', originalPrice: '', realPrice: '', affiliateShare: '0', isFree: false,
    postPurchaseHeadline: '', postPurchaseMessage: '', postPurchaseLinkUrl: '', postPurchaseLinkText: ''
  });
  const [files, setFiles] = useState({ thumbnail: null, digitalFile: null });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Verification
  const [verificationTier, setVerificationTier] = useState('none');

  // Payments
  const [paymentDetails, setPaymentDetails] = useState({ type: 'paypal', details: '' });

  // Chats
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatReply, setChatReply] = useState('');

  // Profile Settings
  const [profileForm, setProfileForm] = useState({
    bannerUrl: '', profileImage: '', bio: '', portfolioUrl: '', country: '',
    socialLinks: { instagram: '', facebook: '', twitter: '', website: '' }
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!storedToken || user.role !== 'seller') {
      router.push('/login');
      return;
    }
    
    setToken(storedToken);
    setUserProfile(user);
    if (user.sellerProfile) {
      setProfileForm({
        bannerUrl: user.sellerProfile.bannerUrl || '',
        profileImage: user.sellerProfile.profileImage || '',
        bio: user.sellerProfile.bio || '',
        portfolioUrl: user.sellerProfile.portfolioUrl || '',
        country: user.country || '',
        socialLinks: user.sellerProfile.socialLinks || { instagram: '', facebook: '', twitter: '', website: '' }
      });
    }
    loadAnalytics(storedToken, timeRange);
    loadProducts(user._id);
    loadChats(storedToken);
  }, [router, timeRange]);

  const loadAnalytics = async (t: string, range: string) => {
    try {
      const data = await fetchSellerAnalytics(t, range);
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async (sellerId: string) => {
    try {
      const data = await fetchProducts({ sellerId });
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadChats = async (t: string) => {
    try {
      const data = await fetchAllChats(t);
      setChats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(productForm).forEach(([key, val]) => {
        if (key !== 'isFree' && !key.startsWith('postPurchase')) {
          fd.append(key, val as string);
        }
      });
      
      const postPurchaseObj = {
        headline: productForm.postPurchaseHeadline,
        message: productForm.postPurchaseMessage,
        linkUrl: productForm.postPurchaseLinkUrl,
        linkText: productForm.postPurchaseLinkText
      };
      fd.append('postPurchase', JSON.stringify(postPurchaseObj));
      
      // If it's free, force prices to 0
      if (productForm.isFree) {
        fd.set('originalPrice', '0');
        fd.set('realPrice', '0');
      }

      if (files.thumbnail) fd.append('thumbnail', files.thumbnail);
      if (files.digitalFile) fd.append('digitalFile', files.digitalFile);

      setFiles({ thumbnail: null, digitalFile: null });
      setThumbnailPreview('');
      setAddProductStep(1);
      
      // Refresh the product list
      await createProduct(fd, token);
      await loadProducts(userProfile._id);
      
      // Redirect to products list
      setActiveTab('products');
      setStatus('Product created successfully!');
    } catch (err: any) {
      setStatus(err.message || 'Error creating product');
    }
    setLoading(false);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, thumbnail: file as any });
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVerifyPurchase = async (tier: string, price: number) => {
    if (!token) return;
    setLoading(true);
    try {
      // Simulate Razorpay success
      await purchaseVerification(token, tier, 'sim_txn_' + Date.now());
      setVerificationTier(tier);
      setStatus(`Successfully upgraded to ${tier}!`);
    } catch (err: any) {
      setStatus(err.message || 'Verification purchase failed');
    }
    setLoading(false);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await addPaymentMethod(token, paymentDetails.type, paymentDetails.details);
      setStatus('Payment method added successfully');
    } catch (err: any) {
      setStatus(err.message);
    }
  };

  const handleReplyChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedChat || !chatReply.trim()) return;
    try {
      await adminReplyChat(token, selectedChat._id, chatReply);
      setChatReply('');
      loadChats(token);
    } catch (err: any) {
      setStatus('Error sending reply');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', profileForm.bio);
      formData.append('country', profileForm.country);
      formData.append('socialLinks', JSON.stringify(profileForm.socialLinks));
      if (bannerFile) formData.append('bannerFile', bannerFile);
      if (profileImageFile) formData.append('profileImageFile', profileImageFile);

      const updatedUser = await updateSellerProfile(token, formData);
      setUserProfile(updatedUser.user);
      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      setStatus('Profile updated successfully!');
    } catch (err: any) {
      setStatus(err.message || 'Error updating profile');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className={styles.container} style={{ flex: 1, minHeight: 0, paddingTop: '80px' }}>
        {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        {sidebarOpen && <div className={styles.logo}>Seller Portal</div>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={styles.sidebarToggle}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        <nav className={styles.nav} style={{ flex: 1 }}>
          <button className={activeTab === 'profile' ? styles.active : ''} onClick={() => setActiveTab('profile')} title="Profile"><User size={20}/>{sidebarOpen && ' Profile'}</button>
          <button className={activeTab === 'analytics' ? styles.active : ''} onClick={() => setActiveTab('analytics')} title="Analytics"><BarChart3 size={20}/>{sidebarOpen && ' Analytics'}</button>
          <button className={activeTab === 'products' ? styles.active : ''} onClick={() => setActiveTab('products')} title="My Products"><Package size={20}/>{sidebarOpen && ' My Products'}</button>
          <button className={activeTab === 'add_product' ? styles.active : ''} onClick={() => setActiveTab('add_product')} title="Add Product"><PlusCircle size={20}/>{sidebarOpen && ' Add Product'}</button>
          <button className={activeTab === 'chats' ? styles.active : ''} onClick={() => setActiveTab('chats')} title="Customer Chats"><MessageCircle size={20}/>{sidebarOpen && ' Customer Chats'}</button>
          <button className={activeTab === 'payments' ? styles.active : ''} onClick={() => setActiveTab('payments')} title="Payments"><DollarSign size={20}/>{sidebarOpen && ' Payments'}</button>
          <div style={{ flex: 1 }}></div>
          <button className={activeTab === 'settings' ? styles.active : ''} onClick={() => setActiveTab('settings')} title="Settings"><Settings size={20}/>{sidebarOpen && ' Settings'}</button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main} style={activeTab === 'profile' ? { padding: 0 } : {}}>
        {status && <div className={styles.statusBox}>{status}</div>}

        {activeTab === 'analytics' && analytics && (
          <div className={styles.tabContent}>
            <h3>Overview</h3>
            <div className={styles.timeFilter}>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={styles.select}>
                <option value="24h">Last 24 Hours</option>
                <option value="28d">Last 28 Days</option>
                <option value="3m">Last 3 Months</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h4>Total Revenue</h4>
                <div className={styles.statValue}>₹{analytics.totalRevenue.toLocaleString()}</div>
              </div>
              <div className={styles.statCard}>
                <h4>Total Sales</h4>
                <div className={styles.statValue}>{analytics.totalSales}</div>
              </div>
              <div className={styles.statCard}>
                <h4>Total Views</h4>
                <div className={styles.statValue}>{analytics.totalViews || 0}</div>
              </div>
            </div>

            <div className={styles.chartSection}>
              <h4>Sales by Country</h4>
              {analytics.salesByCountry.length > 0 ? (
                <ul className={styles.countryList}>
                  {analytics.salesByCountry.map((c: any) => (
                    <li key={c.name}><span>{c.name}</span> <strong>{c.sales} Sales</strong></li>
                  ))}
                </ul>
              ) : (
                <p>No country data yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.profilePage}>
            {/* Banner */}
            <div
              className={styles.profileBanner}
              style={{ backgroundImage: profileForm.bannerUrl ? `url(${profileForm.bannerUrl})` : undefined }}
            >
              {!profileForm.bannerUrl && (
                <div className={styles.profileBannerPlaceholder}>
                  <span>No banner set — go to Settings to add one</span>
                </div>
              )}
            </div>

            {/* Profile Info Row */}
            <div className={styles.profileInfoRow}>
              {/* LEFT: Avatar + name + meta */}
              <div className={styles.profileLeft}>
                <div className={styles.profileAvatar}>
                  {profileForm.profileImage
                    ? <img src={profileForm.profileImage} alt="avatar" />
                    : <span>{userProfile?.name?.[0]?.toUpperCase() || 'S'}</span>
                  }
                </div>
                <div className={styles.profileMeta}>
                  <h2 className={styles.profileName}>{userProfile?.name || 'Seller Name'}</h2>
                  <p className={styles.profileBio}>{profileForm.bio || 'No bio set yet.'}</p>
                  <div className={styles.followStats} style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <span onClick={() => { setModalType('followers'); setFollowModalOpen(true); }} style={{cursor: 'pointer', color: '#475569', fontSize: '0.95rem'}}>
                      <strong style={{color: '#0f172a', fontSize: '1.1rem'}}>{userProfile?.followers?.length || 0}</strong> Followers
                    </span>
                    <span onClick={() => { setModalType('following'); setFollowModalOpen(true); }} style={{cursor: 'pointer', color: '#475569', fontSize: '0.95rem'}}>
                      <strong style={{color: '#0f172a', fontSize: '1.1rem'}}>{userProfile?.following?.length || 0}</strong> Following
                    </span>
                  </div>
                  <div className={styles.profileStats}>
                    <span className={styles.pStat} title="Rating">
                      <svg width="16" height="16" fill="#f59e0b" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      {analytics?.rating ? `${analytics.rating.toFixed(1)} (${analytics.totalReviews} Reviews)` : '0 Reviews'}
                    </span>
                    {userProfile?.country && <span className={styles.pStat} title="Country">🌍 {userProfile.country}</span>}
                    <span className={styles.pStat} title="Total Sales">🛍 {analytics?.totalSales || 0} sales</span>
                    <span 
                      className={styles.pStat} 
                      title="Total Products" 
                      onClick={() => setActiveTab('products')}
                      style={{ cursor: 'pointer', color: products.length === 0 ? '#7c3aed' : undefined, fontWeight: products.length === 0 ? 600 : undefined }}
                    >
                      📦 {products.length === 0 ? 'Add product' : `${products.length} products`}
                    </span>
                    <span className={styles.pStat} title="Time on platform">
                      📅 {userProfile?.createdAt
                        ? `${Math.floor((Date.now() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days on platform`
                        : '0 days on platform'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Social links */}
              <div className={styles.profileSocials}>
                {profileForm.socialLinks?.instagram && (
                  <a href={profileForm.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Instagram">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {profileForm.socialLinks?.twitter && (
                  <a href={profileForm.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Twitter / X">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {profileForm.socialLinks?.facebook && (
                  <a href={profileForm.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Facebook">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {profileForm.socialLinks?.website && (
                  <a href={profileForm.socialLinks.website} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Website">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                )}
                {!profileForm.socialLinks?.instagram && !profileForm.socialLinks?.twitter && !profileForm.socialLinks?.facebook && !profileForm.socialLinks?.website && (
                  <span className={styles.noSocials}>No social links — add them in Settings</span>
                )}
              </div>
            </div>

            {/* Display products below profile if there are any */}
            {products.length > 0 && (
              <div style={{ padding: '0 36px 36px 36px', background: 'white' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Your Products</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
                  {products.map((product: any) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <h3>Shop Profile Settings</h3>
            <p className={styles.verifyDesc}>Customize how your public shop looks to customers.</p>
            
            <form className={styles.form} onSubmit={handleProfileSubmit} style={{ maxWidth: '800px', marginTop: '20px' }}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Banner Image <small>(Recommended: 1200x300 px)</small></label>
                  <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} />
                  {profileForm.bannerUrl && !bannerFile && <small>Current banner is set.</small>}
                </div>
                <div className={styles.formGroup}>
                  <label>Profile Avatar</label>
                  <input type="file" accept="image/*" onChange={e => setProfileImageFile(e.target.files?.[0] || null)} />
                  {profileForm.profileImage && !profileImageFile && <small>Current avatar is set.</small>}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Bio / Description</label>
                  <textarea placeholder="Tell buyers about your shop..." value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                </div>
                <div className={styles.formGroup} style={{ width: '250px' }}>
                  <label>Country</label>
                  <select 
                    value={profileForm.country} 
                    onChange={e => setProfileForm({...profileForm, country: e.target.value})}
                    className={styles.select}
                    style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1.05rem', color: '#334155' }}
                  >
                    <option value="">Select your country</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Social Links</h4>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Instagram URL</label>
                  <input placeholder="https://instagram.com/..." value={profileForm.socialLinks.instagram} onChange={e => setProfileForm({...profileForm, socialLinks: {...profileForm.socialLinks, instagram: e.target.value}})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Facebook URL</label>
                  <input placeholder="https://facebook.com/..." value={profileForm.socialLinks.facebook} onChange={e => setProfileForm({...profileForm, socialLinks: {...profileForm.socialLinks, facebook: e.target.value}})} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Twitter/X URL</label>
                  <input placeholder="https://twitter.com/..." value={profileForm.socialLinks.twitter} onChange={e => setProfileForm({...profileForm, socialLinks: {...profileForm.socialLinks, twitter: e.target.value}})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Website URL</label>
                  <input placeholder="https://yourwebsite.com" value={profileForm.socialLinks.website} onChange={e => setProfileForm({...profileForm, socialLinks: {...profileForm.socialLinks, website: e.target.value}})} />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: '20px' }}>
                {loading ? 'Saving...' : 'Save Profile Settings'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'products' && (
          <div className={styles.tabContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0 }}>My Products</h3>
              <button 
                onClick={() => setActiveTab('add_product')}
                style={{ background: '#7c3aed', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <PlusCircle size={18} /> Add New Product
              </button>
            </div>
            
            {products.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <Package size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#334155' }}>No products yet</h4>
                <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>Start building your catalog by adding your first product.</p>
                <button 
                  onClick={() => setActiveTab('add_product')}
                  style={{ background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Product
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
                {products.map((product: any) => (
                  <ProductCard key={product._id} {...product} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add_product' && (
          <div className={styles.tabContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Add New Product</h3>
              <button 
                onClick={() => setPreviewModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#e2e8f0', color: '#0f172a', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
              >
                <Eye size={16} /> Live Preview
              </button>
            </div>
            
            <div className={styles.productCreationLayout} style={{ display: 'block', maxWidth: '700px' }}>
              {/* FORM */}
              <form className={styles.form} onSubmit={handleProductSubmit}>
                {addProductStep === 1 ? (
                  <>
                    <h4 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Step 1: Before Buying (Product Details)</h4>
                    <div className={styles.formGroup}>
                      <label>Title</label>
                      <input required placeholder="Product Title" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Description</label>
                      <textarea required placeholder="Product Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                        <input 
                          type="checkbox" 
                          id="isFreeCheckbox"
                          checked={productForm.isFree} 
                          onChange={e => {
                            setProductForm({...productForm, isFree: e.target.checked, originalPrice: e.target.checked ? '0' : '', realPrice: e.target.checked ? '0' : ''});
                          }} 
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isFreeCheckbox" style={{ cursor: 'pointer', margin: 0, color: '#10b981' }}>Offer this product for FREE</label>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Original Price</label>
                        <input required type="number" placeholder="99" value={productForm.isFree ? '0' : productForm.originalPrice} disabled={productForm.isFree} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Selling Price</label>
                        <input required type="number" placeholder="49" value={productForm.isFree ? '0' : productForm.realPrice} disabled={productForm.isFree} onChange={e => setProductForm({...productForm, realPrice: e.target.value})} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Category</label>
                        <input required placeholder="e.g. Notion Templates" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Affiliate Share (%)</label>
                      <input type="number" placeholder="20" value={productForm.affiliateShare} onChange={e => setProductForm({...productForm, affiliateShare: e.target.value})} />
                      <small>Percentage of your earnings you are willing to give to affiliates.</small>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.fileInputBox}>
                        <label>Thumbnail Image</label>
                        <input type="file" onChange={handleThumbnailChange} />
                      </div>
                      <div className={styles.fileInputBox}>
                        <label>Digital File (Zip/PDF)</label>
                        <input type="file" onChange={(e: any) => setFiles({...files, digitalFile: e.target.files[0]})} />
                      </div>
                    </div>

                    <button type="button" onClick={() => setAddProductStep(2)} className={styles.submitBtn} style={{ background: '#7c3aed' }}>
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <h4 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Step 2: After Buying (Post-Purchase Details)</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>This information will be shown to the customer immediately after they purchase.</p>
                    
                    <div className={styles.formGroup}>
                      <label>Thank You Headline</label>
                      <input placeholder="e.g. Thanks for your purchase!" value={productForm.postPurchaseHeadline} onChange={e => setProductForm({...productForm, postPurchaseHeadline: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Post-Purchase Message</label>
                      <textarea placeholder="e.g. Here is how you can access your templates..." value={productForm.postPurchaseMessage} onChange={e => setProductForm({...productForm, postPurchaseMessage: e.target.value})} />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Action Link URL (Optional)</label>
                        <input type="url" placeholder="https://..." value={productForm.postPurchaseLinkUrl} onChange={e => setProductForm({...productForm, postPurchaseLinkUrl: e.target.value})} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Action Link Text</label>
                        <input placeholder="e.g. Join Discord" value={productForm.postPurchaseLinkText} onChange={e => setProductForm({...productForm, postPurchaseLinkText: e.target.value})} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                      <button type="button" onClick={() => setAddProductStep(1)} className={styles.submitBtn} style={{ background: '#e2e8f0', color: '#0f172a', flex: 1 }}>
                        Back
                      </button>
                      <button type="submit" className={styles.submitBtn} disabled={loading} style={{ flex: 2 }}>
                        {loading ? 'Publishing...' : 'Publish Product'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
            
            {/* LIVE PREVIEW MODAL */}
            {previewModalOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setPreviewModalOpen(false)}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setPreviewModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✕</button>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a', textAlign: 'center' }}>Live Preview</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>This is how your product will appear in the catalog.</p>
                  <div style={{ pointerEvents: 'none' }}>
                    <ProductCard 
                      _id="preview"
                      title={productForm.title || "Amazing Digital Product"}
                      category={productForm.category || "Category"}
                      originalPrice={productForm.isFree ? 0 : (Number(productForm.originalPrice) || 99)}
                      realPrice={productForm.isFree ? 0 : (Number(productForm.realPrice) || 49)}
                      description={productForm.description || "Start typing a description to see it appear here..."}
                      image={thumbnailPreview || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className={styles.tabContent}>
            <h3>Customer Inquiries</h3>
            <div className={styles.chatContainer}>
              <div className={styles.chatList}>
                {chats.map(chat => (
                  <div key={chat._id} className={`${styles.chatItem} ${selectedChat?._id === chat._id ? styles.selectedChat : ''}`} onClick={() => setSelectedChat(chat)}>
                    <h4>{chat.userName}</h4>
                    <p>{chat.lastMessage}</p>
                    {chat.messages.some((m:any) => !m.readByAdmin && m.sender === 'user') && <div className={styles.unreadDot} />}
                  </div>
                ))}
              </div>
              <div className={styles.chatBox}>
                {selectedChat ? (
                  <>
                    <div className={styles.chatMessages}>
                      {selectedChat.messages.map((m: any, i: number) => (
                        <div key={i} className={`${styles.message} ${m.sender === 'seller' || m.sender === 'admin' ? styles.myMessage : styles.theirMessage}`}>
                          {m.text}
                          {m.productName && <div className={styles.productRef}>Re: {m.productName}</div>}
                        </div>
                      ))}
                    </div>
                    <form className={styles.chatInputRow} onSubmit={handleReplyChat}>
                      <input value={chatReply} onChange={e => setChatReply(e.target.value)} placeholder="Type a reply..." />
                      <button type="submit"><Send size={18}/></button>
                    </form>
                  </>
                ) : (
                  <div className={styles.emptyChat}>Select a conversation</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className={styles.tabContent}>
            <h3>Withdrawal Methods</h3>
            <div className={styles.paymentCard}>
              <h4>Current Balance</h4>
              <h2>₹{analytics?.totalRevenue?.toLocaleString() || 0}</h2>
              <button className={styles.withdrawBtn}>Request Withdrawal</button>
            </div>

            <h4 style={{marginTop: '2rem'}}>Add Payment Method</h4>
            <form className={styles.form} onSubmit={handleAddPayment}>
              <div className={styles.formGroup}>
                <label>Method Type</label>
                <select value={paymentDetails.type} onChange={e => setPaymentDetails({...paymentDetails, type: e.target.value})} className={styles.select}>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer (NEFT/RTGS)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Details (Email or Account No.)</label>
                <input required placeholder="Enter details..." value={paymentDetails.details} onChange={e => setPaymentDetails({...paymentDetails, details: e.target.value})} />
              </div>
              <button type="submit" className={styles.submitBtn}>Save Method</button>
            </form>
          </div>
        )}
      </main>
      </div>

      <FollowModal 
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        type={modalType}
        userId={userProfile?._id}
        loggedInUserId={userProfile?._id}
        token={token || undefined}
      />
    </div>
  );
}
