import { Suspense } from 'react';
import CategoryPage from '@/components/CategoryPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AccessoriesPage() {
  // Check if user is authenticated to view restricted category
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoryPage categoryName="Accessories" categoryId={2} />
    </Suspense>
  );
}
