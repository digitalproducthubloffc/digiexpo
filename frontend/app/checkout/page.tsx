import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutFlow from '@/components/CheckoutFlow';

async function getProduct(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export default async function CheckoutPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) {
    notFound();
  }

  const product = await getProduct(searchParams.id);
  
  if (!product) {
    notFound();
  }

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <CheckoutFlow product={product} />
      </div>
      <Footer />
    </main>
  );
}
