'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSellerAnalytics, addPaymentMethod, purchaseVerification, updateSellerProfile, fetchProducts, createProduct, BASE_URL, fetchAllChats, adminReplyChat, adminMarkChatRead } from '@/lib/api';
import { BarChart3, Settings, DollarSign, Package, MessageCircle, Link as LinkIcon, BadgeCheck, Upload, PlayCircle, Eye, Activity } from 'lucide-react';
import styles from './sellerDashboard.module.css';

export default function SellerDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'products' | 'payments' | 'verification' | 'chats' | 'affiliates'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('all');

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [productForm, setProductForm] = useState({
    title: '', description: '', category: '', originalPrice: '', realPrice: '', affiliateShare: '0', termsAndConditions: ''
  });
  const [files, setFiles] = useState({ thumbnail: null, digitalFile: null });

  // Verification
  const [verificationTier, setVerificationTier] = useState('none');

  // Payments
  const [paymentDetails, setPaymentDetails] = useState({ type: 'paypal', details: '' });

  // Chats
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatReply, setChatReply] = useState('');

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
    loadAnalytics(storedToken, timeRange);
    loadProducts();
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

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      // In a real app we'd fetch only seller products, but for now filter on frontend if needed or API handles it
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
      Object.entries(productForm).forEach(([key, val]) => fd.append(key, val as string));
      if (files.thumbnail) fd.append('thumbnail', files.thumbnail);
      if (files.digitalFile) fd.append('digitalFile', files.digitalFile);

      await createProduct(token, fd);
      setStatus('Product created successfully!');
      loadProducts();
    } catch (err: any) {
      setStatus(err.message || 'Error creating product');
    }
    setLoading(false);
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

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Seller Portal</div>
        <nav className={styles.nav}>
          <button className={activeTab === 'analytics' ? styles.active : ''} onClick={() => setActiveTab('analytics')}><BarChart3 size={20}/> Analytics</button>
          <button className={activeTab === 'products' ? styles.active : ''} onClick={() => setActiveTab('products')}><Package size={20}/> My Products</button>
          <button className={activeTab === 'chats' ? styles.active : ''} onClick={() => setActiveTab('chats')}><MessageCircle size={20}/> Customer Chats</button>
          <button className={activeTab === 'verification' ? styles.active : ''} onClick={() => setActiveTab('verification')}><BadgeCheck size={20}/> Verification</button>
          <button className={activeTab === 'payments' ? styles.active : ''} onClick={() => setActiveTab('payments')}><DollarSign size={20}/> Payments</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Profile Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerOverlay}>
            <h2>{userProfile?.name} {verificationTier !== 'none' && <BadgeCheck color="#10b981" />}</h2>
            <p>Seller Dashboard</p>
          </div>
        </div>

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

        {activeTab === 'products' && (
          <div className={styles.tabContent}>
            <h3>Add New Product</h3>
            <form className={styles.form} onSubmit={handleProductSubmit}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input required placeholder="Product Title" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea required placeholder="Product Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Original Price</label>
                  <input required type="number" placeholder="99" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Selling Price</label>
                  <input required type="number" placeholder="49" value={productForm.realPrice} onChange={e => setProductForm({...productForm, realPrice: e.target.value})} />
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

              <div className={styles.formGroup}>
                <label>Terms & Conditions</label>
                <textarea placeholder="e.g. No refunds on digital products" value={productForm.termsAndConditions} onChange={e => setProductForm({...productForm, termsAndConditions: e.target.value})} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.fileInputBox}>
                  <label>Thumbnail Image</label>
                  <input type="file" onChange={(e: any) => setFiles({...files, thumbnail: e.target.files[0]})} />
                </div>
                <div className={styles.fileInputBox}>
                  <label>Digital File (Zip/PDF)</label>
                  <input type="file" onChange={(e: any) => setFiles({...files, digitalFile: e.target.files[0]})} />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Product'}
              </button>
            </form>
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

        {activeTab === 'verification' && (
          <div className={styles.tabContent}>
            <h3>Get Verified</h3>
            <p className={styles.verifyDesc}>Boost your sales by showing customers you are a trusted seller. Verified sellers get priority search ranking and custom badges.</p>
            <div className={styles.tiersGrid}>
              <div className={styles.tierCard}>
                <h4>Standard Badge</h4>
                <div className={styles.price}>$5</div>
                <ul>
                  <li>Blue Checkmark</li>
                  <li>Standard Support</li>
                </ul>
                <button onClick={() => handleVerifyPurchase('tier1', 5)} className={styles.tierBtn}>Purchase</button>
              </div>
              <div className={styles.tierCard}>
                <h4>Pro Seller</h4>
                <div className={styles.price}>$7</div>
                <ul>
                  <li>Gold Checkmark</li>
                  <li>Lower Platform Fees</li>
                </ul>
                <button onClick={() => handleVerifyPurchase('tier2', 7)} className={styles.tierBtn}>Purchase</button>
              </div>
              <div className={styles.tierCard}>
                <h4>Elite Partner</h4>
                <div className={styles.price}>$10</div>
                <ul>
                  <li>Diamond Checkmark</li>
                  <li>Lowest Platform Fees</li>
                  <li>Priority Analytics</li>
                </ul>
                <button onClick={() => handleVerifyPurchase('tier3', 10)} className={styles.tierBtn}>Purchase</button>
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
  );
}
