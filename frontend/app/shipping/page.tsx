import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Shipping & Delivery | Digital Product Hub',
  description: 'Our shipping and delivery policy for digital products.',
};

export default function ShippingPolicyPage() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ padding: '100px 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#0f172a' }}>Shipping & Delivery Policy</h1>
        
        <div style={{ lineHeight: '1.8', color: '#334155' }}>
          <p style={{ marginBottom: '1.5rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>1. Delivery Method</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We deal exclusively in digital products (3D models, architectural plans, digital templates, and other creative assets). Therefore, no physical items will be shipped to your physical address.
          </p>
          
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>2. Instant Delivery</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Upon successful payment processing, your digital products are delivered instantly. You will gain access to your purchased items in two ways:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Email Delivery:</strong> A confirmation email containing the secure download link(s) will be sent to the email address you provided during checkout.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>User Dashboard:</strong> If you created an account (or logged in prior to purchase), your products will be permanently available in the "My Dashboard" section of our website.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>3. Delivery Issues</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you do not receive the confirmation email within 15 minutes of a successful payment, please check your Spam or Junk folder. If the email is still missing, or if you encounter issues accessing the file in your dashboard, please contact our support team immediately.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>4. Access Limits</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Once purchased, you will generally have lifetime access to the digital files through your account, provided the service remains active. We strongly recommend downloading your files to a secure personal storage device soon after purchase.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
