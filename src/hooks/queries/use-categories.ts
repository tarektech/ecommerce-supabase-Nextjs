import { categoryService } from '@/services/category/categoryService'
import { CategoryType } from '@/types'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

// Query Keys
export const categoryKeys = {
	all: ['categories'] as const,
	lists: () => [...categoryKeys.all, 'list'] as const,
	details: () => [...categoryKeys.all, 'detail'] as const,
	detail: (id: number) => [...categoryKeys.details(), id] as const,
}

// Get all categories
export function useCategories(options?: UseQueryOptions<CategoryType[]>) {
	return useQuery({
		queryKey: categoryKeys.lists(),
		queryFn: categoryService.getCategories,
		staleTime: 10 * 60 * 1000, // 10 minutes (categories rarely change)
		gcTime: 30 * 60 * 1000, // 30 minutes cache
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

// Get category by ID
export function useCategory(
	categoryId: number,
	options?: UseQueryOptions<CategoryType | null>
) {
	return useQuery({
		queryKey: categoryKeys.detail(categoryId),
		queryFn: () => categoryService.getCategoryById(categoryId),
		enabled: !!categoryId && categoryId > 0,
		staleTime: 10 * 60 * 1000,
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

