import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Contact Us | Digital Product Hub',
  description: 'Get in touch with the Digital Product Hub team.',
};

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ padding: '100px 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#0f172a' }}>Contact Us</h1>
        
        <div style={{ lineHeight: '1.8', color: '#334155' }}>
          <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>
            We'd love to hear from you. Whether you have a question about a product, need technical support, or just want to say hi, our team is ready to answer all your questions.
          </p>
          
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Customer Support</h2>
            <p style={{ marginBottom: '1rem' }}>
              For general inquiries, payment issues, or download assistance, please email us directly:
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              <a href="mailto:digitalproducthubloffc@gmail.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
                digitalproducthubloffc@gmail.com
              </a>
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
              We typically respond within 24-48 business hours.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Business Information</h2>
            <p style={{ marginBottom: '0.5rem' }}><strong>Operating Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Platform:</strong> Digital Product Hub / DigiExpo</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
              *If you have a business address or phone number, it can be displayed here for additional compliance and trust.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
