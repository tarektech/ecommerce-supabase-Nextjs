import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';
import { productServerService } from '@/services/product/productServerService';

interface ProductDetailsPageProps {
  params: {
    productId: string;
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const product = await productServerService.getProductById(params.productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
