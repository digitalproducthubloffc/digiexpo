'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { addReview } from '@/lib/api';
import styles from './ProductReviews.module.css';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductReviews({ productId, initialReviews }: { productId: string, initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('token'));
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to leave a review.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Decode name from token or generic if not present. The backend allows 'name' in body.
      // Usually, we'd get the name from a user context, but 'Anonymous User' works as fallback.
      const res = await addReview(productId, rating, comment, token);
      
      // Assume res.product contains the updated product with the new reviews list or just append current local state.
      // Easiest is to append locally for instant feedback
      const newReview = res.product.reviews[res.product.reviews.length - 1]; 
      setReviews([...reviews, newReview]);
      
      setSuccess('Your review has been published successfully!');
      setComment('');
      setRating(5);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.headerRow}>
        <h3>Archivist Reviews</h3>
        <span className={styles.countBadge}>{reviews.length} reviews</span>
      </div>

      <div className={styles.content}>
        {/* Left Side: Review Form or Login Prompt */}
        <div className={styles.formSection}>
          {isLogged ? (
            <form onSubmit={handleSubmit} className={styles.reviewForm}>
              <h4>Leave a Rating</h4>
              
              <div className={styles.ratingSelect}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={styles.starBtn}
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star 
                      size={24} 
                      fill={star <= rating ? '#eab308' : 'none'} 
                      color={star <= rating ? '#eab308' : '#cbd5e1'} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with these assets..."
                required
                rows={4}
                className={styles.textarea}
              />

              {error && <div className={styles.errorMsg}>{error}</div>}
              {success && <div className={styles.successMsg}>{success}</div>}

              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting ? 'Publishing...' : 'Publish Rating'}
              </button>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <h4>Join the community to share your thoughts.</h4>
              <p>Sign in to rate and review this asset.</p>
              <a href="/login" className={styles.loginBtn}>Sign In to Verify</a>
            </div>
          )}
        </div>

        {/* Right Side: List of Reviews */}
        <div className={styles.reviewsList}>
          {reviews.length === 0 ? (
            <p className={styles.noReviews}>No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            [...reviews].reverse().map((review) => (
              <div key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.avatar}>
                    {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.reviewerName}>{review.name || 'Anonymous User'}</span>
                    <span className={styles.date}>
                      {isMounted ? new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : ''}
                    </span>
                  </div>
                </div>
                
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i <= review.rating ? '#eab308' : 'none'} 
                      color={i <= review.rating ? '#eab308' : '#e2e8f0'} 
                    />
                  ))}
                </div>
                
                <p className={styles.comment}>{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
