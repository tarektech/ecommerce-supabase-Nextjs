import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image skeleton */}
        <Skeleton className="aspect-square w-full" />

        {/* Content skeletons */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
