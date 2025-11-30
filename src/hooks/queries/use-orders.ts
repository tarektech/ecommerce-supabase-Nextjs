import { orderService } from '@/services/order/orderService'
import { OrderType } from '@/types'
import {
	useQuery,
	useMutation,
	useQueryClient,
	UseQueryOptions,
} from '@tanstack/react-query'

// Query Keys
export const orderKeys = {
	all: ['orders'] as const,
	lists: () => [...orderKeys.all, 'list'] as const,
	list: (userId: string) => [...orderKeys.lists(), { userId }] as const,
	details: () => [...orderKeys.all, 'detail'] as const,
	detail: (id: string) => [...orderKeys.details(), id] as const,
}

// Get all orders for a user
export function useOrders(
	userId: string,
	options?: UseQueryOptions<OrderType[]>
) {
	return useQuery({
		queryKey: orderKeys.list(userId),
		queryFn: () => orderService.getOrders(userId),
		enabled: !!userId,
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

// Get order by ID
export function useOrder(orderId: string, options?: UseQueryOptions<OrderType>) {
	return useQuery({
		queryKey: orderKeys.detail(orderId),
		queryFn: () => orderService.getOrderById(orderId),
		enabled: !!orderId,
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

// Create order mutation
export function useCreateOrder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: orderService.createOrder,
		onSuccess: (_data, variables) => {
			// Invalidate orders list for the user
			if (variables.userId) {
				queryClient.invalidateQueries({
					queryKey: orderKeys.list(variables.userId),
				})
			}
			// Also invalidate all orders lists
			queryClient.invalidateQueries({
				queryKey: orderKeys.lists(),
			})
		},
	})
}

// Update order status mutation
export function useUpdateOrderStatus() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			orderId,
			status,
		}: {
			orderId: number
			status: string
		}) => {
			return orderService.updateOrderStatus(String(orderId), status)
		},
		onSuccess: (data) => {
			if (data) {
				// Invalidate specific order
				queryClient.invalidateQueries({
					queryKey: orderKeys.detail(String(data.id)),
				})
				// Invalidate all orders lists
				queryClient.invalidateQueries({
					queryKey: orderKeys.lists(),
				})
			}
		},
	})
}

// Delete order mutation
export function useDeleteOrder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			orderId,
			userId,
		}: {
			orderId: string
			userId?: string
		}) => {
			await orderService.deleteOrder(orderId)
			return { orderId, userId }
		},
		onSuccess: (_, variables) => {
			// Invalidate specific order
			queryClient.invalidateQueries({
				queryKey: orderKeys.detail(variables.orderId),
			})
			// If userId provided, invalidate that user's orders list
			if (variables.userId) {
				queryClient.invalidateQueries({
					queryKey: orderKeys.list(variables.userId),
				})
			}
			// Invalidate all orders lists
			queryClient.invalidateQueries({
				queryKey: orderKeys.lists(),
			})
		},
	})
}

