'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { fetchMyChat, sendChatMessage, markChatRead } from '@/lib/api';
import styles from './ProductChatSection.module.css';

interface Props {
  productId: string;
}

export default function ProductChatSection({ productId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      loadChat();
    }
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Poll for new messages every 8 seconds when chat is open
  useEffect(() => {
    if (!isOpen || !isLoggedIn) return;
    const interval = setInterval(() => {
      loadChat(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen, isLoggedIn]);

  const loadChat = async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await fetchMyChat(token);
      setChat(data);
      // Count unread admin messages
      const unread = data.messages?.filter((m: any) => m.sender === 'admin' && !m.readByUser).length || 0;
      setUnreadCount(unread);
      if (isOpen && unread > 0) {
        await markChatRead(token);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const token = localStorage.getItem('token');
    if (!token || (!message.trim())) return;
    setLoading(true);
    try {
      const data = await sendChatMessage(token, message.trim());
      setChat(data);
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSend = async (file: File) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const data = await sendChatMessage(token, '', file);
      setChat(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    setIsOpen(!isOpen);
  };

  if (!isMounted) return null;

  return (
    <div className={styles.chatSection}>
      {!isOpen ? (
        <button className={styles.openBtn} onClick={toggleChat}>
          <MessageCircle size={20} />
          <span>Chat with Seller about this Product</span>
          {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
        </button>
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatAvatar}>S</div>
              <div>
                <h4>Seller Chat</h4>
                <span className={styles.onlineStatus}>● Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={18} /></button>
          </div>

          <div className={styles.chatMessages}>
            {(!chat?.messages || chat.messages.length === 0) && (
              <div className={styles.emptyChat}>
                <MessageCircle size={32} />
                <p>Have questions about this product? Send a message!</p>
              </div>
            )}

            {chat?.messages?.map((msg: any, i: number) => (
              <div key={i} className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userMsg : styles.adminMsg}`}>
                {msg.mediaUrl && (
                  <div className={styles.mediaBubble}>
                    {msg.mediaType === 'video' ? (
                      <video src={msg.mediaUrl} controls className={styles.mediaContent} />
                    ) : (
                      <img src={msg.mediaUrl} alt="Shared media" className={styles.mediaContent} />
                    )}
                  </div>
                )}
                {msg.text && <p>{msg.text}</p>}
                <span className={styles.msgTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInput}>
            <button 
              className={styles.attachBtn} 
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              title="Attach Image/Video"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaSend(file);
                e.target.value = '';
              }}
            />
            <input
              type="text"
              placeholder="Ask a question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button 
              onClick={handleSend} 
              className={styles.sendBtn}
              disabled={loading || !message.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
