'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';
import styles from './SupportForm.module.css';

export default function SupportForm() {
  const [formData, setFormData] = useState({ name: '', email: '', problem: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('Thank you! Your request has been received.');
        setFormData({ name: '', email: '', problem: '' });
      } else {
        setStatus('Error sending request. Please try again.');
      }
    } catch (err) {
      setStatus('Connection error.');
    }
  };

  return (
    <div className={styles.supportBox}>
      <h3>Customer Support</h3>
      <p>Having trouble? Tell us about it and we'll help you out.</p>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Your Name" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required 
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required 
        />
        <textarea 
          placeholder="Describe your problem..." 
          value={formData.problem}
          onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
          required
        ></textarea>
        <button type="submit">Submit Request</button>
        {status && <p className={styles.status}>{status}</p>}
      </form>
    </div>
  );
}
