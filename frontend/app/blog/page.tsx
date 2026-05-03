'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { fetchBlogs, BASE_URL } from '@/lib/api';
import styles from './blog.module.css';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadBlogs = async () => {
      try {
        const data = await fetchBlogs();
        setBlogs(data);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  return (
    <main className={styles.pageWrapper}>
      <Navbar />
      
      <header className={styles.blogHeader}>
        <div className="container">
          <span className={styles.subtitle}>INSIGHTS & UPDATES</span>
          <h1 className={styles.title}>The Digital <span>Perspective</span></h1>
          <p className={styles.description}>Exploring the intersection of premium design, architectural precision, and digital innovation.</p>
        </div>
      </header>

      <section className={`${styles.postsSection} container`}>
        {loading ? (
          <div className={styles.loading}>Curating latest insights...</div>
        ) : blogs.length > 0 ? (
          <div className={styles.blogGrid}>
            {blogs.map((post) => (
              <article key={post._id} className={styles.blogCard}>
                <div className={styles.cardImage}>
                  <img src={post.thumbnail?.startsWith('http') ? post.thumbnail : `${BASE_URL}${post.thumbnail}`} alt={post.title} />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.meta}>
                    <span><User size={14} /> {post.author}</span>
                    <span><Calendar size={14} /> {isMounted ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.excerpt}>{post.subtitle}</p>
                  <Link href={`/blog/${post._id}`} className={styles.readMore}>
                    Read Full Article <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyBlogs}>
             <h3>No articles published yet.</h3>
             <p>Stay tuned for premium architectural insights and design trends.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
