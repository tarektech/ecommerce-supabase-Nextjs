import { addressService } from '@/services/address/addressService'
import { AddressType } from '@/types'
import {
	useQuery,
	useMutation,
	useQueryClient,
	UseQueryOptions,
} from '@tanstack/react-query'

// Query Keys
export const addressKeys = {
	all: ['addresses'] as const,
	lists: () => [...addressKeys.all, 'list'] as const,
	list: (userId: string) => [...addressKeys.lists(), { userId }] as const,
	details: () => [...addressKeys.all, 'detail'] as const,
	detail: (id: string) => [...addressKeys.details(), id] as const,
}

// Get all addresses for a user
export function useAddresses(
	userId: string,
	options?: UseQueryOptions<AddressType[]>
) {
	return useQuery({
		queryKey: addressKeys.list(userId),
		queryFn: () => addressService.getAddresses(userId),
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

// Create address mutation
export function useCreateAddress() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			address,
			userId,
		}: {
			address: AddressType
			userId: string
		}) => {
			return addressService.saveAddress({ address, userId })
		},
		onSuccess: (_, variables) => {
			// Invalidate addresses list for the user
			queryClient.invalidateQueries({
				queryKey: addressKeys.list(variables.userId),
			})
		},
	})
}

// Update address mutation
export function useUpdateAddress() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			addressId,
			address,
		}: {
			addressId: string
			address: Partial<AddressType>
			userId: string
		}) => {
			return addressService.updateAddress(addressId, address)
		},
		onSuccess: (data, variables) => {
			// Invalidate specific address
			if (data?.id) {
				queryClient.invalidateQueries({
					queryKey: addressKeys.detail(String(data.id)),
				})
			}
			// Invalidate addresses list for the user
			queryClient.invalidateQueries({
				queryKey: addressKeys.list(variables.userId),
			})
		},
	})
}

// Delete address mutation
export function useDeleteAddress() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			addressId,
			userId,
		}: {
			addressId: string
			userId: string
		}) => {
			await addressService.deleteAddress(addressId)
			return { addressId, userId }
		},
		onSuccess: (_, variables) => {
			// Invalidate specific address
			queryClient.invalidateQueries({
				queryKey: addressKeys.detail(variables.addressId),
			})
			// Invalidate addresses list for the user
			queryClient.invalidateQueries({
				queryKey: addressKeys.list(variables.userId),
			})
		},
	})
}

