import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Product Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        The product you&apos;re looking for might have been removed or
        doesn&apos;t exist.
      </p>
      <Link
        href="/products"
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Browse Products
      </Link>
    </div>
  );
}
