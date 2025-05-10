import { orderService } from '@/services/order/orderService';
import { OrderType } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (userId: string) => [...orderKeys.lists(), { userId }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Get all orders for a user
export function useOrders(
  userId: string,
  options?: UseQueryOptions<OrderType[]>
) {
  return useQuery({
    queryKey: orderKeys.list(userId),
    queryFn: () => orderService.getOrders(userId),
    enabled: !!userId,
    ...options,
  });
}

// Get order by ID
export function useOrder(
  orderId: string,
  options?: UseQueryOptions<OrderType>
) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
    ...options,
  });
}
