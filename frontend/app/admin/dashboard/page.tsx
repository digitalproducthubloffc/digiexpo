'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct, fetchProducts, deleteProduct, fetchStats, fetchSalesByCountry, fetchBlogs, createBlog, deleteBlog, fetchAffiliateApplications, approveAffiliateApplication, BASE_URL } from '@/lib/api';
import { Upload, X, Plus, Image as ImageIcon, Trash2, LayoutGrid, FilePlus, ExternalLink, BarChart3, TrendingUp, Globe, Users, ShoppingBag, BookOpenText, PlayCircle, Eye } from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics' | 'blog' | 'affiliates'>('analytics');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [affiliateApps, setAffiliateApps] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [countryStats, setCountryStats] = useState<any>({ salesByCountry: [], viewsByCountry: [] });

  // Product Form States
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [fields, setFields] = useState({
    title: '', description: '', details: '', tags: '', category: 'Cars Drawing', fileType: 'DXF', fileSize: '', originalPrice: '', realPrice: '',
  });

  // Blog Form States
  const [blogThumbPreview, setBlogThumbPreview] = useState<string | null>(null);
  const [blogMediaPreviews, setBlogMediaPreviews] = useState<{url: string, type: string}[]>([]);
  const [blogFields, setBlogFields] = useState({
    title: '', subtitle: '', content: '', author: 'Admin'
  });

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const digitalFileRef = useRef<HTMLInputElement>(null);
  
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setStatus('');
    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      if (thumbnailRef.current?.files?.[0]) formData.append('thumbnail', thumbnailRef.current.files[0]);
      if (galleryRef.current?.files) {
        Array.from(galleryRef.current.files).forEach(f => formData.append('gallery', f));
      }
      if (digitalFileRef.current?.files?.[0]) formData.append('digitalFile', digitalFileRef.current.files[0]);
      await createProduct(formData, token);
      setStatus('✅ Product published!');
      loadDashboardData(token);
      setActiveTab('manage');
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
                    <div className={styles.inputGroup}><label>Category</label><input type="text" placeholder="Enter Category" value={fields.category} onChange={e => setFields({...fields, category: e.target.value})} required /></div>
                  </div>
                  <div className={styles.inputGroup}><label>Description</label><textarea rows={4} value={fields.description} onChange={e => setFields({...fields, description: e.target.value})} required /></div>
                  <button type="submit" className={styles.publishBtn} disabled={loading}>{loading ? 'Publishing...' : 'Publish to Marketplace'}</button>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
