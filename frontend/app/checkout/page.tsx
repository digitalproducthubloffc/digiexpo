import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutFlow from '@/components/CheckoutFlow';

import { fetchProductById } from '@/lib/api';

async function getProduct(id: string) {
  try {
    return await fetchProductById(id);
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
