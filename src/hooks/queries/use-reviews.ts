import { reviewService } from '@/services/review/reviewService';
import { ReviewType } from '@/types';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

// Query Keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (productId: string) => [...reviewKeys.lists(), { productId }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: number) => [...reviewKeys.details(), id] as const,
};

// Get reviews for product
export function useProductReviews(
  productId: string,
  options?: UseQueryOptions<ReviewType[]>
) {
  return useQuery({
    queryKey: reviewKeys.list(productId),
    queryFn: () => reviewService.getReviewsByProduct(productId),
    enabled: !!productId,
    ...options,
  });
}

// Get review by ID
export function useReview(
  reviewId: number | undefined,
  options?: UseQueryOptions<ReviewType | null>
) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId || 0),
    queryFn: () => reviewService.getReviewById(reviewId || 0),
    enabled: !!reviewId,
    ...options,
  });
}

// Create review
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
    }: {
      productId: string;
      rating: number;
      comment: string;
    }) => {
      return reviewService.createReview(productId, rating, comment);
    },
    onSuccess: (data) => {
      if (data?.product_id) {
        // Invalidate reviews for this product
        queryClient.invalidateQueries({
          queryKey: reviewKeys.list(data.product_id),
        });
      }
    },
  });
}

// Update review
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      rating,
      comment,
    }: {
      id: number;
      rating: number;
      comment: string;
    }) => {
      return reviewService.updateReview(id, rating, comment);
    },
    onSuccess: (data) => {
      if (data) {
        // Invalidate specific review
        queryClient.invalidateQueries({
          queryKey: reviewKeys.detail(data.id),
        });

        if (data.product_id) {
          // Invalidate reviews for this product
          queryClient.invalidateQueries({
            queryKey: reviewKeys.list(data.product_id),
          });
        }
      }
    },
  });
}
