'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct, fetchProducts, deleteProduct, fetchStats, fetchSalesByCountry, fetchBlogs, createBlog, deleteBlog, fetchAffiliateApplications, approveAffiliateApplication, fetchAllChats, fetchChatById, adminReplyChat, adminMarkChatRead, adminCloseChat, BASE_URL } from '@/lib/api';
import { Upload, X, Plus, Image as ImageIcon, Trash2, LayoutGrid, FilePlus, ExternalLink, BarChart3, TrendingUp, Globe, Users, ShoppingBag, BookOpenText, PlayCircle, Eye, MessageCircle, Send, Paperclip } from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics' | 'blog' | 'affiliates' | 'messages'>('analytics');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [affiliateApps, setAffiliateApps] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [countryStats, setCountryStats] = useState<any>({ salesByCountry: [], viewsByCountry: [] });

  // Chat States
  const [allChats, setAllChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const chatMediaRef = useRef<HTMLInputElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Product Form States
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [fields, setFields] = useState({
    title: '', description: '', details: '', tags: '', type: 'Website/Portfolio', websiteLink: '', customizationAvailable: 'false', fileType: 'DXF', fileSize: '', originalPrice: '', realPrice: '',
  });
  const [postPurchaseFields, setPostPurchaseFields] = useState({
    headline: '',
    message: '',
    linkUrl: '',
    linkText: ''
  });
  const [externalPurchaseLink, setExternalPurchaseLink] = useState('');
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);

  // Blog Form States
  const [blogThumbPreview, setBlogThumbPreview] = useState<string | null>(null);
  const [blogMediaPreviews, setBlogMediaPreviews] = useState<{url: string, type: string}[]>([]);
  const [blogFields, setBlogFields] = useState({
    title: '', subtitle: '', content: '', author: 'Admin'
  });

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const digitalFileRef = useRef<HTMLInputElement>(null);
  const postImageRef = useRef<HTMLInputElement>(null);
  
  const blogThumbRef = useRef<HTMLInputElement>(null);
  const blogMediaRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    if (!t) {
      router.push('/admin/login');
    } else {
      setToken(t);
      loadDashboardData(t);
    }
  }, []);

  const loadDashboardData = async (t: string) => {
    try {
      const [prods, blogs, s, cs, apps] = await Promise.all([
        fetchProducts(),
        fetchBlogs(),
        fetchStats(t),
        fetchSalesByCountry(t),
        fetchAffiliateApplications(t)
      ]);
      setAllProducts(prods);
      setAllBlogs(blogs);
      setStats(s);
      setCountryStats(cs);
      setAffiliateApps(apps);
    } catch (err) {
      console.error(err);
    }
  };

  const loadChats = async (t: string) => {
    try {
      const chats = await fetchAllChats(t);
      setAllChats(chats);
    } catch (err) {
      console.error(err);
    }
  };

  const selectChat = async (chatId: string) => {
    if (!token) return;
    try {
      const chat = await fetchChatById(chatId, token);
      setSelectedChat(chat);
      await adminMarkChatRead(chatId, token);
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminReply = async () => {
    if (!token || !selectedChat || !replyText.trim()) return;
    setReplySending(true);
    try {
      const updated = await adminReplyChat(selectedChat._id, token, replyText.trim());
      setSelectedChat(updated);
      setReplyText('');
      loadChats(token);
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setReplySending(false);
    }
  };

  const handleAdminMediaReply = async (file: File) => {
    if (!token || !selectedChat) return;
    setReplySending(true);
    try {
      const updated = await adminReplyChat(selectedChat._id, token, '', file);
      setSelectedChat(updated);
      loadChats(token);
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setReplySending(false);
    }
  };

  const handleCloseChat = async (chatId: string) => {
    if (!token) return;
    try {
      await adminCloseChat(chatId, token);
      loadChats(token);
      if (selectedChat?._id === chatId) setSelectedChat(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setStatus('');
    try {
      const formData = new FormData();
      const safeFields = {
        ...fields,
        category: fields.type, // Map type to category to satisfy backend
        originalPrice: fields.originalPrice || fields.realPrice,
        details: fields.details?.trim() ? fields.details : '[]',
        tags: fields.tags?.trim() ? fields.tags : '[]'
      };
      Object.entries(safeFields).forEach(([k, v]) => formData.append(k, v));
      formData.append('postPurchase', JSON.stringify(postPurchaseFields));
      formData.append('externalPurchaseLink', externalPurchaseLink);
      if (thumbnailRef.current?.files?.[0]) formData.append('thumbnail', thumbnailRef.current.files[0]);
      if (galleryRef.current?.files) {
        Array.from(galleryRef.current.files).forEach(f => formData.append('gallery', f));
      }
      if (digitalFileRef.current?.files?.[0]) formData.append('digitalFile', digitalFileRef.current.files[0]);
      if (postImageRef.current?.files?.[0]) formData.append('postImage', postImageRef.current.files[0]);
      await createProduct(formData, token);
      setStatus('✅ Product published!');
      loadDashboardData(token);
      setActiveTab('manage');
      setCreateStep(1);
    } catch (err: any) { setStatus(`❌ ${err.message}`); } finally { setLoading(false); }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setStatus('');
    try {
      const formData = new FormData();
      Object.entries(blogFields).forEach(([k, v]) => formData.append(k, v));
      if (blogThumbRef.current?.files?.[0]) formData.append('thumbnail', blogThumbRef.current.files[0]);
      if (blogMediaRef.current?.files) {
        Array.from(blogMediaRef.current.files).forEach(f => formData.append('media', f));
      }
      await createBlog(formData, token);
      setStatus('✅ Blog article published!');
      setBlogFields({ title: '', subtitle: '', content: '', author: 'Admin' });
      setBlogThumbPreview(null);
      setBlogMediaPreviews([]);
      loadDashboardData(token);
      setActiveTab('blog');
    } catch (err: any) { setStatus(`❌ ${err.message}`); } finally { setLoading(false); }
  };

  const deleteBlogAction = async (id: string) => {
    if (!token || !confirm('Delete blog?')) return;
    await deleteBlog(id, token);
    loadDashboardData(token);
  };

  if (!token) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.brand}>
             <h2>HUB ADMIN</h2>
             <p>EDITORIAL & ARCHIVE</p>
          </div>
          
          <nav className={styles.nav}>
            <button className={activeTab === 'analytics' ? styles.active : ''} onClick={() => setActiveTab('analytics')}>
              <BarChart3 size={20} /> Insight Deck
            </button>
            <button className={activeTab === 'manage' ? styles.active : ''} onClick={() => setActiveTab('manage')}>
              <LayoutGrid size={20} /> Archive Inventory
            </button>
            <button className={activeTab === 'create' ? styles.active : ''} onClick={() => setActiveTab('create')}>
              <FilePlus size={20} /> New Asset
            </button>
            <button className={activeTab === 'blog' ? styles.active : ''} onClick={() => setActiveTab('blog')}>
              <BookOpenText size={20} /> Editorial Hub
            </button>
            <button className={activeTab === 'affiliates' ? styles.active : ''} onClick={() => setActiveTab('affiliates')}>
              <Users size={20} /> Affiliates
            </button>
            <button className={activeTab === 'messages' ? styles.active : ''} onClick={() => { setActiveTab('messages'); if(token) loadChats(token); }}>
              <MessageCircle size={20} /> Messages
              {allChats.filter(c => c.messages?.some((m: any) => m.sender === 'user' && !m.readByAdmin)).length > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, marginLeft: 6 }}>
                  {allChats.filter(c => c.messages?.some((m: any) => m.sender === 'user' && !m.readByAdmin)).length}
                </span>
              )}
            </button>
          </nav>

          <button onClick={() => { localStorage.removeItem('adminToken'); router.push('/admin/login'); }} className={styles.logoutBtn}>
            Logout Session
          </button>
        </div>

        <main className={styles.mainContent}>
          {status && <div className={styles.statusBanner}>{status}</div>}

          {activeTab === 'analytics' && stats && (
            <div className={styles.analyticsSection}>
               <div className={styles.sectionHeader}>
                <h2>Performance Analytics</h2>
                <p>Live metrics from global transactions.</p>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><TrendingUp size={24} /></div>
                  <div className={styles.statInfo}><span>Total Revenue</span><h3>${stats.totalRevenue.toLocaleString()}</h3></div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><ShoppingBag size={24} /></div>
                  <div className={styles.statInfo}><span>Total Sales</span><h3>{stats.totalSales}</h3></div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><Eye size={24} /></div>
                  <div className={styles.statInfo}><span>Total Views</span><h3>{stats.totalViews || 0}</h3></div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><Globe size={24} /></div>
                  <div className={styles.statInfo}><span>Active Users</span><h3>{stats.totalUsers}</h3></div>
                </div>
              </div>

              {/* Country Breakdown Section */}
              <div className={styles.countryAnalytics}>
                <div className={styles.countryBox}>
                   <div className={styles.boxHeader}>
                    <Globe size={20} />
                    <h3>Visitor Origins (Views)</h3>
                  </div>
                  <div className={styles.countryList}>
                    {countryStats.viewsByCountry?.length > 0 ? (
                      countryStats.viewsByCountry.map((c: any) => (
                        <div key={c._id} className={styles.countryRow}>
                          <span className={styles.countryName}>{c._id === 'Unknown' ? '🌐 Global Traffic' : `📍 ${c._id}`}</span>
                          <span className={styles.countryValue}>{c.views} views</span>
                        </div>
                      ))
                    ) : <p className={styles.emptyTable}>No traffic data recorded yet.</p>}
                  </div>
                </div>

                <div className={styles.countryBox}>
                   <div className={styles.boxHeader}>
                    <ShoppingBag size={20} />
                    <h3>Sales by Region</h3>
                  </div>
                  <div className={styles.countryList}>
                    {countryStats.salesByCountry?.length > 0 ? (
                      countryStats.salesByCountry.map((c: any) => (
                        <div key={c._id} className={styles.countryRow}>
                          <span className={styles.countryName}>{c._id || 'Global'}</span>
                          <span className={styles.countryValue}>${c.revenue.toLocaleString()}</span>
                        </div>
                      ))
                    ) : <p className={styles.emptyTable}>No sales recorded yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blog' && (
            <div className={styles.blogDashboard}>
              <div className={styles.blogFormSection}>
                <form className={styles.form} onSubmit={handleBlogSubmit}>
                  <div className={styles.sectionHeader}>
                    <h2>Write New Article</h2>
                    <p>Draft premium articles with rich media (Images & Videos).</p>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.imageCol}>
                       <div className={styles.fieldBlock}>
                        <label>Featured Thumbnail</label>
                        <div className={styles.uploadBox} onClick={() => blogThumbRef.current?.click()}>
                          {blogThumbPreview ? <img src={blogThumbPreview} className={styles.fullPreview} /> : <div className={styles.placeholder}><ImageIcon size={32} /><span>Upload Image</span></div>}
                          <input ref={blogThumbRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && setBlogThumbPreview(URL.createObjectURL(e.target.files[0]))} />
                        </div>
                      </div>

                      <div className={styles.fieldBlock}>
                        <label>Post Gallery (Images/Videos)</label>
                        <div className={styles.galleryStrip}>
                           {blogMediaPreviews.map((m, i) => (
                             <div key={i} className={styles.stripItem}>
                               {m.type === 'video' ? <PlayCircle size={20} /> : <img src={m.url} />}
                             </div>
                           ))}
                           <button type="button" className={styles.addStrip} onClick={() => blogMediaRef.current?.click()}><Plus size={20}/></button>
                           <input ref={blogMediaRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => {
                             const files = Array.from(e.target.files || []);
                             const p = files.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video/') ? 'video' : 'image' }));
                             setBlogMediaPreviews(prev => [...prev, ...p]);
                           }} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.metaCol}>
                      <div className={styles.inputGroup}>
                        <label>Article Title</label>
                        <input type="text" value={blogFields.title} onChange={e => setBlogFields({...blogFields, title: e.target.value})} required />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Subtitle / Excerpt</label>
                        <input type="text" value={blogFields.subtitle} onChange={e => setBlogFields({...blogFields, subtitle: e.target.value})} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Main Content</label>
                        <textarea rows={10} value={blogFields.content} onChange={e => setBlogFields({...blogFields, content: e.target.value})} required />
                      </div>
                      <button type="submit" className={styles.publishBtn} disabled={loading}>{loading ? 'Publishing...' : 'Publish Article'}</button>
                    </div>
                  </div>
                </form>
              </div>

              <div className={styles.blogManageSection}>
                 <div className={styles.sectionHeader}><h2>Published Articles</h2></div>
                 <div className={styles.productTable}>
                    {allBlogs.map(b => (
                      <div key={b._id} className={styles.tableRow}>
                        <img src={b.thumbnail?.startsWith('http') ? b.thumbnail : `${BASE_URL}${b.thumbnail}`} alt={b.title} className={styles.rowImg} />
                        <div className={styles.rowInfo}><h4>{b.title}</h4><p>By {b.author} • {new Date(b.createdAt).toLocaleDateString()}</p></div>
                        <div className={styles.rowActions}>
                          <Link href={`/blog`} target="_blank" className={styles.viewBtn}><ExternalLink size={18} /></Link>
                          <button onClick={() => deleteBlogAction(b._id)} className={styles.deleteBtn}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className={styles.manageSection}>
              <div className={styles.sectionHeader}><h2>Inventory Archive</h2><span>Total Assets: {allProducts.length}</span></div>
              <div className={styles.productTable}>
                {allProducts.map(p => (
                  <div key={p._id} className={styles.tableRow}>
                    <img src={p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image}`} alt="" className={styles.rowImg} />
                    <div className={styles.rowInfo}><h4>{p.title}</h4><p>{p.category} • ${p.realPrice}</p></div>
                    <div className={styles.rowActions}>
                      <Link href={`/product/${p._id}`} target="_blank" className={styles.viewBtn}><ExternalLink size={18} /></Link>
                      <button onClick={() => { if(confirm('Delete?')) deleteProduct(p._id, token!).then(() => loadDashboardData(token!)) }} className={styles.deleteBtn}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'affiliates' && (
            <div className={styles.manageSection}>
              <div className={styles.sectionHeader}><h2>Affiliate Applications</h2><span>Total Apps: {affiliateApps.length}</span></div>
              <div className={styles.productTable}>
                {affiliateApps.map(app => (
                  <div key={app._id} className={styles.tableRow}>
                    <div className={styles.rowInfo}>
                      <h4>{app.name}</h4>
                      <p>{app.email} • {app.audienceSize} • {app.commission || '20%'} • <a href={app.website} target="_blank" style={{color: 'var(--primary)'}}>{app.website}</a></p>
                    </div>
                    <div className={styles.rowActions}>
                      <span style={{ marginRight: '15px', fontWeight: 'bold', color: app.status === 'approved' ? 'green' : 'orange' }}>
                        {app.status.toUpperCase()}
                      </span>
                      {app.status === 'pending' && (
                        <button 
                          onClick={() => {
                            if(confirm('Approve this affiliate?')) {
                              approveAffiliateApplication(app._id, token!).then(() => loadDashboardData(token!));
                            }
                          }} 
                          className={styles.publishBtn}
                          style={{ padding: '8px 16px', margin: '0' }}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <form className={styles.form} onSubmit={handleProductSubmit}>
              <div className={styles.sectionHeader}><h2>Create New Asset</h2><p>Ensure all metadata matches premium standards.</p></div>
              <div style={{ display: createStep === 1 ? 'block' : 'none' }}>
                <div className={styles.formGrid}>
                  <div className={styles.imageCol}>
                    <div className={styles.fieldBlock}>
                      <label>Main Preview</label>
                      <div className={styles.uploadBox} onClick={() => thumbnailRef.current?.click()}>
                        {thumbnailPreview ? <img src={thumbnailPreview} className={styles.fullPreview} /> : <div className={styles.placeholder}><ImageIcon size={32} /><span>Upload Image</span></div>}
                        <input ref={thumbnailRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && setThumbnailPreview(URL.createObjectURL(e.target.files[0]))} />
                      </div>
                    </div>
                    <div className={styles.fieldBlock}>
                      <label>Digital Source</label>
                      <div className={styles.fileLabel} onClick={() => digitalFileRef.current?.click()}>
                        <Upload size={18} /> {digitalFileRef.current?.files?.[0]?.name || "Select DXF/PDF/Zip"}
                        <input ref={digitalFileRef} type="file" hidden />
                      </div>
                    </div>
                  </div>
                  <div className={styles.metaCol}>
                    <div className={styles.inputGroup}><label>Title</label><input type="text" value={fields.title} onChange={e => setFields({...fields, title: e.target.value})} required /></div>
                    <div className={styles.fieldPair}>
                      <div className={styles.inputGroup}><label>Price ($)</label><input type="number" value={fields.realPrice} onChange={e => setFields({...fields, realPrice: e.target.value})} required /></div>
                      <div className={styles.inputGroup}>
                        <label>Product Type</label>
                        <select value={fields.type} onChange={e => setFields({...fields, type: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)', outline: 'none', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem' }}>
                          <option value="Notion Template">Notion Template</option>
                          <option value="Drawings/Sketch">Drawings / Sketch</option>
                          <option value="Website/Portfolio">Website / Portfolio</option>
                        </select>
                      </div>
                    </div>
                    {fields.type === 'Website/Portfolio' && (
                      <div className={styles.fieldPair} style={{ marginBottom: '15px' }}>
                        <div className={styles.inputGroup}>
                          <label>Live Website Link</label>
                          <input type="url" placeholder="https://..." value={fields.websiteLink} onChange={e => setFields({...fields, websiteLink: e.target.value})} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Customization Available?</label>
                          <select value={fields.customizationAvailable} onChange={e => setFields({...fields, customizationAvailable: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)', outline: 'none', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem' }}>
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className={styles.inputGroup}><label>Description</label><textarea rows={4} value={fields.description} onChange={e => setFields({...fields, description: e.target.value})} required /></div>
                    <button
                      type="button"
                      className={styles.publishBtn}
                      disabled={loading}
                      onClick={() => {
                        if (!thumbnailRef.current?.files?.[0]) {
                          setStatus('❌ Please upload the Main Preview image first.');
                          return;
                        }
                        if (!fields.title || !fields.description || !fields.realPrice || !fields.type) {
                          setStatus('❌ Please fill Title, Price, Type and Description first.');
                          return;
                        }
                        setStatus('');
                        setCreateStep(2);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: createStep === 2 ? 'block' : 'none' }}>
                <div className={styles.formGrid}>
                  <div className={styles.imageCol}>
                    <div className={styles.fieldBlock}>
                      <label>After Payment Image (Optional)</label>
                      <div className={styles.uploadBox} onClick={() => postImageRef.current?.click()}>
                        {postImagePreview ? <img src={postImagePreview} className={styles.fullPreview} /> : <div className={styles.placeholder}><ImageIcon size={32} /><span>Upload Image</span></div>}
                        <input
                          ref={postImageRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => e.target.files?.[0] && setPostImagePreview(URL.createObjectURL(e.target.files[0]))}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.publishBtn}
                      style={{ background: 'transparent', border: '1px solid rgba(124,58,237,0.35)', color: 'var(--primary)' }}
                      disabled={loading}
                      onClick={() => setCreateStep(1)}
                    >
                      Back
                    </button>
                  </div>

                  <div className={styles.metaCol}>
                    <div className={styles.inputGroup} style={{ marginBottom: 18, padding: '16px', background: 'rgba(124,58,237,0.06)', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <label style={{ fontWeight: 600, color: 'var(--primary)' }}>🔗 Other Platform Link</label>
                      <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 8px' }}>Paste your Gumroad, Payhip, or any other platform link. The "Buy Now" button will redirect users to this link.</p>
                      <input type="url" placeholder="https://gumroad.com/l/your-product" value={externalPurchaseLink} onChange={e => setExternalPurchaseLink(e.target.value)} />
                    </div>

                    <div className={styles.sectionHeader} style={{ marginBottom: 14 }}>
                      <h2 style={{ fontSize: 20 }}>After Payment Content</h2>
                      <p>Add message/link/image shown after purchase.</p>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Headline (Optional)</label>
                      <input type="text" value={postPurchaseFields.headline} onChange={e => setPostPurchaseFields({ ...postPurchaseFields, headline: e.target.value })} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Message (Optional)</label>
                      <textarea rows={4} value={postPurchaseFields.message} onChange={e => setPostPurchaseFields({ ...postPurchaseFields, message: e.target.value })} />
                    </div>
                    <div className={styles.fieldPair}>
                      <div className={styles.inputGroup}>
                        <label>Link URL (Optional)</label>
                        <input type="url" value={postPurchaseFields.linkUrl} onChange={e => setPostPurchaseFields({ ...postPurchaseFields, linkUrl: e.target.value })} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Link Text (Optional)</label>
                        <input type="text" value={postPurchaseFields.linkText} onChange={e => setPostPurchaseFields({ ...postPurchaseFields, linkText: e.target.value })} />
                      </div>
                    </div>

                    <button type="submit" className={styles.publishBtn} disabled={loading}>
                      {loading ? 'Publishing...' : 'Publish to Marketplace'}
                    </button>
                  </div>
                </div>
              </div>

            </form>
          )}

          {activeTab === 'messages' && (
            <div className={styles.chatDashboard}>
              <div className={styles.sectionHeader}><h2>Customer Messages</h2><p>Respond to customer inquiries in real-time.</p></div>
              
              <div className={styles.chatLayout}>
                {/* Chat List */}
                <div className={styles.chatList}>
                  {allChats.length === 0 ? (
                    <div className={styles.emptyTable} style={{ padding: '3rem 1rem' }}>
                      <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                      <p>No conversations yet</p>
                    </div>
                  ) : (
                    allChats.map(chat => {
                      const unread = chat.messages?.filter((m: any) => m.sender === 'user' && !m.readByAdmin).length || 0;
                      return (
                        <div 
                          key={chat._id} 
                          className={`${styles.chatListItem} ${selectedChat?._id === chat._id ? styles.chatListItemActive : ''}`}
                          onClick={() => selectChat(chat._id)}
                        >
                          <div className={styles.chatListAvatar}>{chat.userName?.[0] || 'U'}</div>
                          <div className={styles.chatListInfo}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4>{chat.userName}</h4>
                              {unread > 0 && <span className={styles.chatUnreadBadge}>{unread}</span>}
                            </div>
                            <p>{chat.lastMessage || 'No messages'}</p>
                            <span className={styles.chatListTime}>
                              {new Date(chat.lastMessageAt).toLocaleDateString()} • {chat.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Window */}
                <div className={styles.chatWindow}>
                  {!selectedChat ? (
                    <div className={styles.chatWindowEmpty}>
                      <MessageCircle size={48} />
                      <h3>Select a conversation</h3>
                      <p>Choose a chat from the left to start responding</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.chatWindowHeader}>
                        <div>
                          <h3>{selectedChat.userName}</h3>
                          <span>{selectedChat.userEmail} • {selectedChat.status.toUpperCase()}</span>
                        </div>
                        {selectedChat.status === 'open' && (
                          <button 
                            onClick={() => handleCloseChat(selectedChat._id)} 
                            className={styles.deleteBtn}
                            style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, width: 'auto', height: 'auto' }}
                          >
                            Close Chat
                          </button>
                        )}
                      </div>

                      <div className={styles.chatWindowMessages}>
                        {selectedChat.messages?.map((msg: any, i: number) => (
                          <div key={i} className={`${styles.adminMsgBubble} ${msg.sender === 'admin' ? styles.adminMsgRight : styles.adminMsgLeft}`}>
                            {msg.mediaUrl && (
                              <div style={{ marginBottom: 6, borderRadius: 12, overflow: 'hidden' }}>
                                {msg.mediaType === 'video' ? (
                                  <video src={msg.mediaUrl} controls style={{ width: '100%', maxHeight: 200, borderRadius: 12 }} />
                                ) : (
                                  <img src={msg.mediaUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12 }} />
                                )}
                              </div>
                            )}
                            {msg.productName && (
                              <div className={styles.productReference}>
                                <span>Regarding: <strong>{msg.productName}</strong></span>
                              </div>
                            )}
                            {msg.text && <p>{msg.text}</p>}
                            <span className={styles.adminMsgTime}>
                              {msg.sender === 'admin' ? '🟣 You' : '🔵 User'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                        <div ref={chatMessagesEndRef} />
                      </div>

                      {selectedChat.status === 'open' && (
                        <div className={styles.chatWindowInput}>
                          <button 
                            className={styles.chatAttachBtn}
                            onClick={() => chatMediaRef.current?.click()}
                            disabled={replySending}
                          >
                            <Paperclip size={18} />
                          </button>
                          <input
                            ref={chatMediaRef}
                            type="file"
                            accept="image/*,video/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAdminMediaReply(file);
                              e.target.value = '';
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Type a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdminReply(); } }}
                            disabled={replySending}
                          />
                          <button 
                            onClick={handleAdminReply}
                            className={styles.chatSendBtn}
                            disabled={replySending || !replyText.trim()}
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
