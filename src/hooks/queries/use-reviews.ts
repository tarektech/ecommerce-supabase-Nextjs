import { reviewService } from '@/services/review/reviewService'
import { ReviewType } from '@/types'
import {
	useQuery,
	useMutation,
	useQueryClient,
	UseQueryOptions,
} from '@tanstack/react-query'

// Query Keys
export const reviewKeys = {
	all: ['reviews'] as const,
	lists: () => [...reviewKeys.all, 'list'] as const,
	list: (productId: string) => [...reviewKeys.lists(), { productId }] as const,
	details: () => [...reviewKeys.all, 'detail'] as const,
	detail: (id: number) => [...reviewKeys.details(), id] as const,
}

// Get reviews for product
export function useGetProductReviews(
	productId: string,
	options?: UseQueryOptions<ReviewType[]>
) {
	return useQuery({
		queryKey: reviewKeys.list(productId),
		queryFn: () => reviewService.getReviewsByProduct(productId),
		enabled: !!productId,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error) => {
			if (
				error instanceof Error &&
				(error.message.includes('404') ||
					error.message.includes('permission'))
			) {
				return false
			}
			return failureCount < 2
		},
		throwOnError: false,
		...options,
	})
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
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error) => {
			if (
				error instanceof Error &&
				(error.message.includes('404') ||
					error.message.includes('not found'))
			) {
				return false
			}
			return failureCount < 2
		},
		throwOnError: false,
		...options,
	})
}

// Create review
export function useCreateReview() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			productId,
			rating,
			comment,
		}: {
			productId: string
			rating: number
			comment: string
		}) => {
			return reviewService.createReview(productId, rating, comment)
		},
		onSuccess: (_data, variables) => {
			// Always invalidate using the productId from variables
			queryClient.invalidateQueries({
				queryKey: reviewKeys.list(variables.productId),
				refetchType: 'active',
			})
		},
	})
}

// Update review
export function useUpdateReview() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			rating,
			comment,
		}: {
			id: number
			rating: number
			comment: string
		}) => {
			return reviewService.updateReview(id, rating, comment)
		},
		onSuccess: (data) => {
			if (data) {
				// Invalidate specific review
				queryClient.invalidateQueries({
					queryKey: reviewKeys.detail(data.id),
				})

				if (data.product_id) {
					// Invalidate reviews for this product
					queryClient.invalidateQueries({
						queryKey: reviewKeys.list(data.product_id),
					})
				}
			}
		},
	})
}

// Delete review
export function useDeleteReview() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, productId }: { id: number; productId?: string }) => {
			const success = await reviewService.deleteReview(id)
			if (!success) {
				throw new Error('Failed to delete review')
			}
			return { id, productId }
		},
		onSuccess: (_data, variables) => {
			// Invalidate specific review
			queryClient.invalidateQueries({
				queryKey: reviewKeys.detail(variables.id),
			})

			// Invalidate all review lists (since we might not always have productId)
			queryClient.invalidateQueries({
				queryKey: reviewKeys.lists(),
			})

			// If productId is provided, also invalidate that specific list
			if (variables.productId) {
				queryClient.invalidateQueries({
					queryKey: reviewKeys.list(variables.productId),
				})
			}
		},
	})
}

