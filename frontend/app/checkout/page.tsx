import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a' }}>Internal Checkout Disabled</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          We are currently processing all transactions securely through our external partner. Please return to the product page and use the Gumroad purchase link.
        </p>
        <a 
          href="/catalog" 
          style={{ 
            display: 'inline-block', 
            background: '#7c3aed', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Return to Catalog
        </a>
      </div>
      <Footer />
    </main>
  );
}
