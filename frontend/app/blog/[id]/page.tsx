'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, User, ArrowLeft, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { fetchBlogById, BASE_URL } from '@/lib/api';
import Link from 'next/link';
import styles from './blog-post.module.css';

export default function BlogPostPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadBlog = async () => {
      try {
        const data = await fetchBlogById(id as string);
        setBlog(data);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  if (loading) return <div className={styles.loading}>Opening Archive...</div>;
  if (!blog) return <div className={styles.error}>Article not found.</div>;

  return (
    <main className={styles.postWrapper}>
      <Navbar />
      
      <article className={`${styles.article} container`}>
        <Link href="/blog" className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Insights
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <span><User size={16} /> {blog.author}</span>
            <span><Calendar size={16} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className={styles.title}>{blog.title}</h1>
          <p className={styles.subtitle}>{blog.subtitle}</p>
        </header>

        <div className={styles.featuredImage}>
          <img src={blog.thumbnail?.startsWith('http') ? blog.thumbnail : `${BASE_URL}${blog.thumbnail}`} alt={blog.title} />
        </div>

        <div className={styles.content}>
          {(blog.content || '').split('\n').map((para: string, i: number) => (
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          ))}
        </div>

        {blog.media && blog.media.length > 0 && (
          <div className={styles.mediaSection}>
            <h3>Gallery & Resources</h3>
            <div className={styles.mediaGrid}>
              {blog.media.map((m: any, i: number) => {
                const url = typeof m === 'string' ? m : m.url;
                if (!url) return null;
                const isVideo = m.type === 'video' || url.match(/\.(mp4|webm|ogg)$/i);
                const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
                return (
                  <div key={i} className={styles.mediaItem}>
                    {isVideo ? (
                      <div className={styles.videoWrapper}>
                        <video src={fullUrl} controls />
                        <div className={styles.videoOverlay}><PlayCircle size={40} /></div>
                      </div>
                    ) : (
                      <img src={fullUrl} alt={`Resource ${i+1}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
