"use client";
import React, { useEffect, useState } from 'react';
import styles from './FollowModal.module.css';
import { X } from 'lucide-react';
import { fetchFollowers, fetchFollowing, toggleFollowUser } from '../lib/api';

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  userId: string;
  loggedInUserId?: string;
  token?: string;
}

export default function FollowModal({ isOpen, onClose, type, userId, loggedInUserId, token }: FollowModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, type, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = type === 'followers' ? await fetchFollowers(userId) : await fetchFollowing(userId);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
    setLoading(false);
  };

  const handleToggleFollow = async (targetId: string) => {
    if (!token) return;
    try {
      const res = await toggleFollowUser(targetId, token);
      // Optimistic update: if we are viewing 'following' and we unfollow, we could remove them or update button
      // But simpler is just to reload the data.
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{type === 'followers' ? 'Followers' : 'Following'}</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>No {type} found.</div>
          ) : (
            <div className={styles.userList}>
              {users.map(u => {
                const isMe = loggedInUserId === u._id;
                // We'd need the current user's following list to know if we're following this user
                // For a simpler MVP, we can just show the list without individual follow buttons 
                // if we don't have the current user's following list loaded.
                // However, the user requested to see them.
                return (
                  <div key={u._id} className={styles.userItem}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {u.sellerProfile?.profileImage ? (
                          <img src={u.sellerProfile.profileImage} alt={u.name} />
                        ) : (
                          <span>{u.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className={styles.name}>{u.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
