import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Refund Policy | Digital Product Hub',
  description: 'Our refund and cancellation policy for digital products.',
};

export default function RefundPolicyPage() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ padding: '100px 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#0f172a' }}>Refund & Cancellation Policy</h1>
        
        <div style={{ lineHeight: '1.8', color: '#334155' }}>
          <p style={{ marginBottom: '1.5rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>1. Digital Products</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Due to the nature of our digital products (3D models, architectural plans, and creative assets), all sales are considered final and non-refundable once the files have been downloaded or accessed.
          </p>
          
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>2. Exceptional Circumstances</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We understand that exceptional circumstances can occur. We may, at our sole discretion, issue a refund if:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>The file you downloaded is corrupted or defective, and our support team cannot resolve the issue.</li>
            <li style={{ marginBottom: '0.5rem' }}>The product description vastly misrepresented the actual item.</li>
            <li style={{ marginBottom: '0.5rem' }}>Duplicate accidental purchases were made (and the duplicate was not downloaded).</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>3. Cancellation Policy</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Since our digital products are delivered instantly upon purchase, there is no cancellation window. Once the payment is successfully processed and the delivery email is sent, the order cannot be cancelled.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>4. Contact Us</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you have issues with a file or believe you qualify for an exceptional refund, please reach out to us at <a href="mailto:digitalproducthubloffc@gmail.com" style={{ color: '#7c3aed', textDecoration: 'underline' }}>digitalproducthubloffc@gmail.com</a> within 7 days of your purchase.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
