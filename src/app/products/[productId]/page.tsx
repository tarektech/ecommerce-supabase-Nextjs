import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';
import { productServerService } from '@/services/product/productServerService';

interface ProductDetailsPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const resolvedParams = await params;
  const product = await productServerService.getProductById(
    resolvedParams.productId
  );

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
