'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, ArrowRight, ShoppingBag, BookOpen, HelpCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import { API_URL, BASE_URL } from '@/lib/api';
import styles from './AIAssistant.module.css';

interface Message {
  role: 'bot' | 'user';
  text: string;
  products?: any[];
  chips?: string[];
}

const QUICK_CHIPS = [
  '🏗️ Architecture plans',
  '🎨 Design templates',
  '📦 What can I buy?',
  '💳 How to pay?',
  '📥 My purchases',
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Hi! I'm **Archivist AI** — your personal guide to DigiExpo's premium digital assets. 🎨\n\nTry asking me to find something or pick a category below!",
      chips: QUICK_CHIPS.slice(0, 4),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts().then(setAllProducts).catch(console.error);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { if (data.purchasedProducts) setUserPurchases(data.purchasedProducts); })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const userText = (text || query).trim();
    if (!userText) return;

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => processResponse(userText), 1200);
  };

  const processResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    let responseText = '';
    let matchedProducts: any[] = [];
    let chips: string[] = [];

    // My purchases
    if ((input.includes('my') || input.includes('i')) && (input.includes('buy') || input.includes('purchas') || input.includes('order') || input.includes('asset'))) {
      if (!isLoggedIn) {
        responseText = "You need to be logged in to view your purchases. Please sign in to your account!";
        chips = ['🔐 How to login?', '📦 What can I buy?'];
      } else if (userPurchases.length > 0) {
        responseText = `You have **${userPurchases.length} asset${userPurchases.length > 1 ? 's' : ''}** in your collection! Here they are:`;
        matchedProducts = userPurchases.slice(0, 3);
        chips = ['🏗️ Find more assets', '💳 How to pay?'];
      } else {
        responseText = "You haven't purchased any assets yet. Let me help you find something amazing!";
        chips = ['🏗️ Architecture plans', '🎨 Design templates', '📦 What can I buy?'];
      }
      addBotMessage(responseText, matchedProducts, chips);
      return;
    }

    // Payment questions
    if (input.includes('pay') || input.includes('razorpay') || input.includes('price') || input.includes('cost') || input.includes('upi') || input.includes('card')) {
      responseText = "We accept **UPI, Credit/Debit Cards, Netbanking** via Razorpay — 100% secure! 🔐\n\nFree products are delivered instantly with no payment needed.";
      chips = ['📥 My purchases', '📦 What can I buy?'];
      addBotMessage(responseText, [], chips);
      return;
    }

    // Download / delivery
    if (input.includes('download') || input.includes('delivery') || input.includes('shipping') || input.includes('get file')) {
      responseText = "Digital assets are delivered **instantly** to your email & saved in your Dashboard under **My Orders**. 📥\n\nNo waiting — buy now, download now!";
      chips = ['📥 My purchases', '💳 How to pay?'];
      addBotMessage(responseText, [], chips);
      return;
    }

    // Greetings
    if (input.match(/^(hi|hello|hey|sup|yo|good morning|good evening)[\s!?]*$/)) {
      responseText = "Hey there! 👋 I'm Archivist AI. I can help you:\n\n• 🔍 Find premium digital assets\n• 📥 Access your purchases\n• 💳 Answer payment questions\n\nWhat are you looking for?";
      chips = QUICK_CHIPS.slice(0, 4);
      addBotMessage(responseText, [], chips);
      return;
    }

    // What can I buy / catalog
    if (input.includes('what') && (input.includes('buy') || input.includes('find') || input.includes('sell') || input.includes('have'))) {
      const categories = [...new Set(allProducts.map((p: any) => p.category).filter(Boolean))];
      responseText = `We have **${allProducts.length} premium digital assets** across ${categories.length} categories:\n\n${categories.slice(0, 5).map(c => `• ${c}`).join('\n')}\n\nWhat interests you?`;
      chips = ['🏗️ Architecture plans', '🎨 Design templates', '🚗 Car drawings'];
      addBotMessage(responseText, [], chips);
      return;
    }

    // Product search — match title/category
    const ignoreWords = ['show', 'me', 'find', 'get', 'how', 'can', 'the', 'is', 'what', 'it', 'to', 'a', 'an'];
    const searchTerms = input.split(' ').filter(w => w.length > 2 && !ignoreWords.includes(w));

    if (searchTerms.length > 0) {
      const relevantProducts = allProducts.filter(p =>
        searchTerms.some(term =>
          p.title?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        )
      );

      if (relevantProducts.length > 0) {
        matchedProducts = relevantProducts.slice(0, 3);
        responseText = `Found **${relevantProducts.length} result${relevantProducts.length > 1 ? 's' : ''}** for "${userInput}":`;
        chips = ['💳 How to pay?', '📥 My purchases'];
        addBotMessage(responseText, matchedProducts, chips);
        return;
      }
    }

    // Fallback
    responseText = `I couldn't find anything specific for *"${userInput}"* 🤔\n\nTry browsing our full catalog or pick a category:`;
    chips = QUICK_CHIPS;
    addBotMessage(responseText, [], chips);
  };

  const addBotMessage = (text: string, products: any[] = [], chips: string[] = []) => {
    setMessages(prev => [...prev, { role: 'bot', text, products, chips }]);
    setIsTyping(false);
  };

  // Render text with **bold** support
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* FAB Button */}
      <button
        className={styles.aiFab}
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        aria-label="Open AI Assistant"
      >
        <div className={styles.fabInner}>
          {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        </div>
        {!isOpen && <span className={styles.fabPulse} />}
      </button>

      {/* Chat Window */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.chatOpen : ''}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.botAvatar}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3>Archivist AI</h3>
              <div className={styles.onlineRow}>
                <span className={styles.statusDot} />
                <span>Always Online</span>
              </div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Message Area */}
        <div className={styles.messageArea}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.messageRow} ${m.role === 'user' ? styles.userRow : styles.botRow}`}>
              {m.role === 'bot' && (
                <div className={styles.botIcon}><Sparkles size={12} /></div>
              )}
              <div className={`${styles.message} ${m.role === 'bot' ? styles.botMsg : styles.userMsg}`}>
                <div className={styles.msgText}>{renderText(m.text)}</div>

                {/* Product Cards */}
                {m.products && m.products.length > 0 && (
                  <div className={styles.productGrid}>
                    {m.products.map(p => (
                      <Link
                        href={`/product/${p._id}`}
                        key={p._id}
                        className={styles.productCard}
                        onClick={() => setIsOpen(false)}
                      >
                        <img
                          src={p.image?.startsWith('http') ? p.image : `${BASE_URL}${p.image}`}
                          alt={p.title}
                        />
                        <div className={styles.productCardInfo}>
                          <span className={styles.productCategory}>{p.category}</span>
                          <p className={styles.productTitle}>{p.title}</p>
                          <div className={styles.productFooter}>
                            <span className={styles.productPrice}>${p.realPrice}</span>
                            <span className={styles.viewLink}>View <ArrowRight size={10} /></span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Quick Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className={styles.chipsRow}>
                    {m.chips.map((chip, ci) => (
                      <button key={ci} className={styles.chip} onClick={() => handleSend(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className={`${styles.messageRow} ${styles.botRow}`}>
              <div className={styles.botIcon}><Sparkles size={12} /></div>
              <div className={`${styles.message} ${styles.botMsg} ${styles.typingMsg}`}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <form className={styles.inputForm} onSubmit={(e) => handleSend(undefined, e)}>
            <input
              type="text"
              placeholder="Ask about products, payments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              suppressHydrationWarning
              className={styles.inputField}
            />
            <button type="submit" className={styles.sendBtn} suppressHydrationWarning>
              <Send size={16} />
            </button>
          </form>
          <p className={styles.poweredBy}>✦ Powered by Archivist AI · DigiExpo</p>
        </div>
      </div>
    </>
  );
}
