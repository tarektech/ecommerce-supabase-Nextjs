import { Suspense } from 'react';
import ProductDetailsClient from '@/app/products/[productId]/ProductDetailsClient';
import { productService } from '@/services/product/productService';
import { notFound } from 'next/navigation';
import ProductLoading from './loading';

// Server component (default in Next.js App Router)
// In server components, params are received directly as props
export default async function ProductDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  // Use server-side data fetching
  const product = await productService.getProductById(params.productId);

  // If product not found, show 404 page
  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductDetailsClient product={product} />
    </Suspense>
  );
}
