'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MessageCircle, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './support.module.css';

const FAQS = [
  {
    q: "How do I download my purchased files?",
    a: "Once your payment is confirmed, you can access all your downloads in your 'Archive Hub' dashboard under the 'Download Purchased' section. We also send a confirmation email with direct links."
  },
  {
    q: "Are the payment methods secure?",
    a: "Yes, we use industry-standard encryption through Razorpay. We never store your card details on our servers, ensuring 100% secure transactions."
  },
  {
    q: "Can I get a refund for a digital product?",
    a: "Due to the nature of digital assets, we generally don't offer refunds once the file has been accessed. However, if there's a technical defect with the file, please contact us and we'll resolve it."
  },
  {
    q: "What file formats do you provide?",
    a: "Most of our architectural and engineering plans are in DXF, PDF, or high-resolution Image formats. Specific formats are listed on each product page."
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className={styles.pageWrapper}>
      <Navbar />
      
      <div className={styles.heroSection}>
        <div className="container">
          <span className={styles.tag}>HELP CENTER</span>
          <h1 className={styles.title}>How can we <span>assist</span> you today?</h1>
          <p className={styles.desc}>Expert support for the world's most detailed digital archives.</p>
        </div>
      </div>

      <section className={`${styles.content} container`}>
        <div className={styles.supportGrid}>
          {/* FAQ Column */}
          <div className={styles.faqCol}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {FAQS.map((faq, i) => (
                <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                  <button className={styles.faqHeader} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && <div className={styles.faqBody}><p>{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className={styles.contactCol}>
            <div className={styles.contactCard}>
              <h2 className={styles.cardTitle}>Direct Contact</h2>
              <p>Prefer to talk? Reach out to our specialist team via any of these channels.</p>
              
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <div className={styles.iconBox}><Mail size={20} /></div>
                  <div>
                    <strong>Email Support</strong>
                    <p>support@digiexpo.com</p>
                  </div>
                </div>
              </div>

              {/* New Contact Form */}
              <form className={styles.supportForm} onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our team will get back to you soon.'); }}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your name" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input type="email" placeholder="your@email.com" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Reason for Contact</label>
                  <select required>
                    <option value="">Select a reason</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing/Payment</option>
                    <option value="download">Download Help</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Message</label>
                  <textarea rows={4} placeholder="How can we help?" required />
                </div>
                <button type="submit" className={styles.submitBtn}>Send Inquiry</button>
              </form>

              <div className={styles.socialPrompt}>
                <span>FOLLOW US FOR UPDATES</span>
                <div className={styles.socialLinks}>
                   <a href="#">Instagram</a> • <a href="#">Twitter</a> • <a href="#">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
