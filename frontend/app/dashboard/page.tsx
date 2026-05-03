'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchUserProfile, fetchUserOrders } from '@/lib/api';
import { BASE_URL } from '@/lib/api';
import { Package, Download, User, CreditCard, Eye, ExternalLink, ShieldCheck } from 'lucide-react';
import styles from './dashboard.module.css';

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLogged(true);

    const loadData = async () => {
      try {
        const [profileData, orderData] = await Promise.all([
          fetchUserProfile(token),
          fetchUserOrders(token)
        ]);
        setUser(profileData.user);
        setStats(profileData.stats);
        setOrders(orderData);

        const savedRecent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(savedRecent);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (!isLogged) return null;

  const renderEmptyState = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className={styles.loading}>Optimizing Dashboard...</div>;

    switch (activeTab) {
      case 'orders':
        return orders.length > 0 ? (
          <div className={styles.panelInner}>
            <h2 className={styles.panelTitle}>Order History</h2>
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <img src={`${BASE_URL}${order.productId?.image}`} alt="" className={styles.orderThumb} />
                  <div className={styles.orderInfo}>
                    <h4>{order.productId?.title || 'Unknown Product'}</h4>
                    <span className={styles.orderDate}>
                      Ordered on {isMounted ? new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderPrice}>
                      {order.amount === 0 ? <span className={styles.freeBadge}>FREE</span> : `$${order.amount.toFixed(2)}`}
                    </span>
                    <span className={styles.statusBadge}>{order.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : renderEmptyState(<Package size={32} />, 'No orders yet', 'You haven\'t unlocked any archives yet.');

      case 'downloads':
        const completedOrders = orders.filter(o => o.status === 'completed' && o.productId?.fileUrl);
        return completedOrders.length > 0 ? (
          <div className={styles.panelInner}>
            <h2 className={styles.panelTitle}>Premium Download Vault</h2>
            <div className={styles.ordersList}>
              {completedOrders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderInfo}>
                    <h4>{order.productId.title}</h4>
                    <span className={styles.orderDate}>Lifetime Access Unlocked</span>
                  </div>
                  <div className={styles.orderRight}>
                    <a href={order.productId.fileUrl.startsWith('http') ? order.productId.fileUrl : `${BASE_URL}${order.productId.fileUrl}`} download target="_blank" className={styles.dlBtn}>
                      <Download size={16} /> Download Source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : renderEmptyState(<Download size={32} />, 'Vault Empty', 'Complete a purchase to see your download links here.');

      case 'profile':
        return (
          <div className={styles.panelInner}>
            <div className={styles.profileBox}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarBig}>{user?.name?.[0] || 'U'}</div>
                <div>
                  <h2>{user?.name}</h2>
                  <p>{user?.email}</p>
                </div>
              </div>
              
              <div className={styles.userStats}>
                <div className={styles.uStatCard}>
                  <span>Products Bought</span>
                  <h3>{stats?.totalBought || 0}</h3>
                </div>
                <div className={styles.uStatCard}>
                  <span>Account Status</span>
                  <h3 className={styles.verified}>VERIFIED <ShieldCheck size={18} /></h3>
                </div>
              </div>

              <div className={styles.profileNotice}>
                <p>Profile details are synced with your primary secure archive account. For security, contact support to change your email.</p>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return orders.length > 0 ? (
          <div className={styles.panelInner}>
            <h2 className={styles.panelTitle}>Financial Ledger</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.payTable}>
                <thead>
                  <tr>
                    <th>Product Title</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.productId?.title}</td>
                      <td className={order.amount === 0 ? styles.freeText : ''}>
                        {order.amount === 0 ? 'FREE' : `$${order.amount.toFixed(2)}`}
                      </td>
                      <td><span className={styles.successBadge}>SUCCESS</span></td>
                      <td className={styles.orderIdText}>{order.orderId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : renderEmptyState(<CreditCard size={32} />, 'No payments found', 'Financial records appear here after purchase.');

      case 'recent':
        return recentlyViewed.length > 0 ? (
          <div className={styles.panelInner}>
            <h2 className={styles.panelTitle}>Recently Viewed Assets</h2>
            <div className={styles.recentGrid}>
              {recentlyViewed.map((item) => (
                <Link href={`/product/${item._id}`} key={item._id} className={styles.recentCard}>
                  <img src={item.image} alt={item.title} className={styles.recentImg} />
                  <div className={styles.recentInfo}>
                    <h4>{item.title}</h4>
                    <span>{item.category}</span>
                    <strong>${item.realPrice?.toFixed(2)}</strong>
                  </div>
                  <ExternalLink size={16} className={styles.recentArrow} />
                </Link>
              ))}
            </div>
          </div>
        ) : renderEmptyState(<Eye size={32} />, 'No recent activity', 'Products you browse will appear here.');

      default:
        return null;
    }
  };

  return (
    <div className={styles.dashWrapper}>
      <Navbar />

      <main className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span>USER DASHBOARD</span>
            <h2>Archive Hub</h2>
          </div>

          <nav className={styles.navMenu}>
            <button className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>
              <Package size={18} /> My Orders
              {orders.length > 0 && <span className={styles.tabCount}>{orders.length}</span>}
            </button>
            <button className={`${styles.navItem} ${activeTab === 'downloads' ? styles.active : ''}`} onClick={() => setActiveTab('downloads')}>
              <Download size={18} /> Download Purchased
            </button>
            <button className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => setActiveTab('profile')}>
              <User size={18} /> Profile Management
            </button>
            <button className={`${styles.navItem} ${activeTab === 'payments' ? styles.active : ''}`} onClick={() => setActiveTab('payments')}>
              <CreditCard size={18} /> Payment History
            </button>
            <button className={`${styles.navItem} ${activeTab === 'recent' ? styles.active : ''}`} onClick={() => setActiveTab('recent')}>
              <Eye size={18} /> Recently Viewed
              {recentlyViewed.length > 0 && <span className={styles.tabCount}>{recentlyViewed.length}</span>}
            </button>
          </nav>

          <button onClick={() => { 
            localStorage.removeItem('token'); 
            localStorage.removeItem('cart');
            localStorage.removeItem('wishlist');
            window.location.href = '/'; 
          }} className={styles.logoutBtn}>
            Sign Out Securely
          </button>
        </aside>

        <section className={styles.contentPanel}>
          {renderContent()}
        </section>
      </main>

      <Footer />
    </div>
  );
}
