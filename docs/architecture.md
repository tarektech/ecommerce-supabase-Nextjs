# Architecture Documentation

## Three-Layer Architecture Pattern

This project follows a clean three-layer architecture to ensure maintainability, testability, and clear separation of concerns.

```
┌─────────────────────────────────────────────────┐
│            Components/Pages                     │
│  (UI Layer - Use hooks only, no direct service) │
└───────────────────┬─────────────────────────────┘
                    │
                    │ imports
                    ▼
┌─────────────────────────────────────────────────┐
│         Hooks (TanStack Query Hooks)            │
│  @hooks/queries/use-*.ts                        │
│  - Caching, state management, invalidation      │
│  - React Query config (staleTime, retry, etc)   │
└───────────────────┬─────────────────────────────┘
                    │
                    │ calls
                    ▼
┌─────────────────────────────────────────────────┐
│             Services Layer                      │
│  @services/*/[entity]Service.ts                 │
│  - Pure data fetching functions                 │
│  - API/Supabase calls                           │
│  - Business logic                               │
│  - Error handling                               │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Services Layer (`src/services/*`)

**Purpose:** Pure data functions for API/database operations

**Rules:**
- NO React hooks (useState, useEffect, etc.)
- NO component logic
- Pure TypeScript functions only
- Handle Supabase/API calls
- Implement business logic
- Throw errors for upstream handling

**Structure:**
```typescript
// src/services/[entity]/[entity]Service.ts
export const [entity]Service = {
	async getAll(): Promise<EntityType[]> {
		const { data, error } = await supabase
			.from('[entity]')
			.select('*')
		
		if (error) throw error
		return data as EntityType[]
	},
	
	async getById(id: string): Promise<EntityType | null> {
		const { data, error } = await supabase
			.from('[entity]')
			.select('*')
			.eq('id', id)
			.single()
		
		if (error) throw error
		return data as EntityType
	},
	
	async create(payload: CreateEntityPayload): Promise<EntityType> {
		const { data, error } = await supabase
			.from('[entity]')
			.insert(payload)
			.select()
			.single()
		
		if (error) throw error
		return data as EntityType
	},
	
	async update(id: string, payload: Partial<EntityType>): Promise<EntityType> {
		const { data, error } = await supabase
			.from('[entity]')
			.update(payload)
			.eq('id', id)
			.select()
			.single()
		
		if (error) throw error
		return data as EntityType
	},
	
	async delete(id: string): Promise<void> {
		const { error } = await supabase
			.from('[entity]')
			.delete()
			.eq('id', id)
		
		if (error) throw error
	},
}

// src/services/[entity]/index.ts
export * from './[entity]Service'
```

**Special Cases:**
- `*ServerService.ts` - Server-side only operations (can import separately)
- `*SubscriptionService.ts` - Real-time subscription handlers

### 2. Query Hooks Layer (`src/hooks/queries/*`)

**Purpose:** TanStack Query wrappers for data fetching and mutations

**Rules:**
- ONLY import from services layer
- Use TanStack Query (useQuery, useMutation)
- Handle caching strategy
- Manage query invalidation
- Configure retry logic
- Export query key factories

**Structure:**
```typescript
// src/hooks/queries/use-[entity].ts
import { [entity]Service } from '@/services/[entity]/[entity]Service'
import { [Entity]Type } from '@/types'
import {
	useQuery,
	useMutation,
	useQueryClient,
	UseQueryOptions,
} from '@tanstack/react-query'

// Query Keys Factory
export const [entity]Keys = {
	all: ['[entity]'] as const,
	lists: () => [...[entity]Keys.all, 'list'] as const,
	list: (filters?: Record<string, unknown>) => 
		[...[entity]Keys.lists(), filters] as const,
	details: () => [...[entity]Keys.all, 'detail'] as const,
	detail: (id: string) => [...[entity]Keys.details(), id] as const,
}

// Get all entities
export function use[Entity]s(options?: UseQueryOptions<[Entity]Type[]>) {
	return useQuery({
		queryKey: [entity]Keys.lists(),
		queryFn: [entity]Service.getAll,
		staleTime: 5 * 60 * 1000, // 5 minutes
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

// Get single entity
export function use[Entity](
	id: string,
	options?: UseQueryOptions<[Entity]Type | null>
) {
	return useQuery({
		queryKey: [entity]Keys.detail(id),
		queryFn: () => [entity]Service.getById(id),
		enabled: !!id,
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

// Create entity mutation
export function useCreate[Entity]() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: [entity]Service.create,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [entity]Keys.all,
			})
		},
	})
}

// Update entity mutation
export function useUpdate[Entity]() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<[Entity]Type> }) =>
			[entity]Service.update(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [entity]Keys.detail(variables.id),
			})
			queryClient.invalidateQueries({
				queryKey: [entity]Keys.lists(),
			})
		},
	})
}

// Delete entity mutation
export function useDelete[Entity]() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: [entity]Service.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [entity]Keys.all,
			})
		},
	})
}
```

**Standard Configuration:**
- `staleTime: 5 * 60 * 1000` (5 minutes) - Data stays fresh
- `gcTime: 10 * 60 * 1000` (10 minutes) - Cache garbage collection
- `retry: 2` attempts max - Don't retry on 404/permission errors
- `throwOnError: false` - Handle errors in components

### 3. Component Layer (`src/components/*` & `src/app/*`)

**Purpose:** UI rendering and user interaction

**Rules for Client Components:**
- ONLY import hooks, NEVER services directly
- Use barrel exports from `@/hooks/queries`
- Handle loading and error states
- Display UI based on hook data

**Rules for Server Components:**
- CAN import services directly (they run on server)
- Mark with comment: `// Server Component - direct service import allowed`
- Prefer server-side data fetching for initial load

**Example - Client Component:**
```typescript
'use client'

import { useProducts } from '@/hooks/queries'
import { ProductCard } from './ProductCard'

export function ProductList() {
	const { data: products, isLoading, error } = useProducts()
	
	if (isLoading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	
	return (
		<div>
			{products?.map(product => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	)
}
```

**Example - Mutation in Component:**
```typescript
'use client'

import { useCreateProduct } from '@/hooks/queries'
import { toast } from 'sonner'

export function CreateProductForm() {
	const createProduct = useCreateProduct()
	
	const handleSubmit = async (data: CreateProductPayload) => {
		try {
			await createProduct.mutateAsync(data)
			toast.success('Product created!')
		} catch (error) {
			toast.error('Failed to create product')
		}
	}
	
	return (
		<form onSubmit={handleSubmit}>
			{/* form fields */}
		</form>
	)
}
```

## Import Rules

### ✅ CORRECT Import Patterns

```typescript
// Components importing hooks
import { useProducts, useProduct } from '@/hooks/queries'

// Hooks importing services
import { productService } from '@/services/product/productService'

// Services importing Supabase
import { supabase } from '@/lib/supabase/client'

// Server Components importing services directly
// Server Component - direct service import allowed
import { productService } from '@/services/product/productService'
```

### ❌ INCORRECT Import Patterns

```typescript
// ❌ Components importing services directly (Client Components)
import { productService } from '@/services/product/productService'

// ❌ Services importing hooks
import { useQuery } from '@tanstack/react-query'

// ❌ Not using barrel exports
import { useProducts } from '@/hooks/queries/use-products'
import { useProduct } from '@/hooks/queries/use-products'
```

## Query Key Factory Pattern

Query keys are crucial for cache management. Use a consistent factory pattern:

```typescript
export const [entity]Keys = {
	all: ['[entity]'] as const,
	lists: () => [...[entity]Keys.all, 'list'] as const,
	list: (filters?: any) => [...[entity]Keys.lists(), filters] as const,
	details: () => [...[entity]Keys.all, 'detail'] as const,
	detail: (id: string) => [...[entity]Keys.details(), id] as const,
}
```

**Benefits:**
- Type-safe query keys
- Easy cache invalidation
- Hierarchical structure
- Prevents typos

**Usage:**
```typescript
// Invalidate all products
queryClient.invalidateQueries({ queryKey: productKeys.all })

// Invalidate only product lists
queryClient.invalidateQueries({ queryKey: productKeys.lists() })

// Invalidate specific product
queryClient.invalidateQueries({ queryKey: productKeys.detail('123') })
```

## When to Use Which Layer

### Use Services When:
- Creating a new data source integration
- Adding new Supabase table operations
- Implementing business logic that doesn't need React
- Writing server-side operations

### Use Query Hooks When:
- Fetching data for Client Components
- Implementing mutations that need cache invalidation
- Adding loading/error states
- Need automatic refetching or polling

### Use Direct Service in Components When:
- Component is a Server Component (pages, layouts)
- Server-side rendering requires initial data
- No client-side reactivity needed

## Error Handling Strategy

### Service Layer
```typescript
// Throw errors, let hooks handle them
if (error) throw error
```

### Hook Layer
```typescript
// Configure retry and error behavior
retry: (failureCount, error) => {
	if (error instanceof Error && 
			(error.message.includes('404') || 
			 error.message.includes('permission'))) {
		return false // Don't retry
	}
	return failureCount < 2 // Retry up to 2 times
},
throwOnError: false, // Don't throw, handle in component
```

### Component Layer
```typescript
// Display user-friendly errors
if (error) {
	return <ErrorMessage message={error.message} />
}
```

## Migration Guide

### Migrating a Component from Service → Hook

**Before:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { productService } from '@/services/product/productService'

export function ProductList() {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	
	useEffect(() => {
		productService.getProducts()
			.then(setProducts)
			.finally(() => setLoading(false))
	}, [])
	
	if (loading) return <div>Loading...</div>
	return <div>{/* render products */}</div>
}
```

**After:**
```typescript
'use client'

import { useProducts } from '@/hooks/queries'

export function ProductList() {
	const { data: products, isLoading } = useProducts()
	
	if (isLoading) return <div>Loading...</div>
	return <div>{/* render products */}</div>
}
```

**Benefits:**
- Automatic caching
- Automatic refetching
- Less boilerplate
- Better error handling
- Loading state management

### Creating a New Feature

1. **Define types** in `src/types/index.ts`
2. **Create service** in `src/services/[entity]/[entity]Service.ts`
3. **Export service** in `src/services/[entity]/index.ts`
4. **Create query hooks** in `src/hooks/queries/use-[entity].ts`
5. **Export hooks** in `src/hooks/queries/index.ts`
6. **Use in components** via `import { use[Entity] } from '@/hooks/queries'`

## Best Practices

1. **Keep services pure** - No React, no hooks, just functions
2. **Use query keys consistently** - Always use the key factory
3. **Configure retry logic** - Don't retry on 404/permission errors
4. **Set appropriate staleTime** - 5 minutes for most data
5. **Invalidate strategically** - Only invalidate what changed
6. **Use barrel exports** - Import from `@/hooks/queries`, not individual files
7. **Handle loading states** - Always check `isLoading` before rendering
8. **Handle errors gracefully** - Show user-friendly error messages
9. **Use TypeScript strictly** - Type all parameters and returns
10. **Document complex logic** - Add comments for non-obvious code

## Testing Strategy

### Service Layer
- Unit test with mocked Supabase client
- Test error handling
- Test data transformations

### Hook Layer
- Test with React Query testing utilities
- Mock service layer
- Test cache invalidation logic

### Component Layer
- Test with React Testing Library
- Mock hooks
- Test user interactions and error states

## Performance Considerations

1. **Caching** - TanStack Query handles automatic caching
2. **Stale-While-Revalidate** - Data shown immediately from cache while refetching
3. **Request Deduplication** - Multiple components using same query = one request
4. **Optimistic Updates** - Update UI before server confirms
5. **Infinite Queries** - Use `useInfiniteQuery` for pagination
6. **Prefetching** - Use `queryClient.prefetchQuery()` for predictable navigation

## Common Patterns

### Dependent Queries
```typescript
const { data: user } = useCurrentUser()
const { data: orders } = useOrders(user?.id, {
	enabled: !!user?.id, // Only fetch when user exists
})
```

### Optimistic Updates
```typescript
const updateProduct = useUpdateProduct()

const handleUpdate = async (id: string, data: Partial<ProductType>) => {
	await updateProduct.mutateAsync({ id, data }, {
		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })
			
			// Snapshot previous value
			const previous = queryClient.getQueryData(productKeys.detail(id))
			
			// Optimistically update
			queryClient.setQueryData(productKeys.detail(id), (old) => ({
				...old,
				...data,
			}))
			
			return { previous }
		},
		onError: (err, variables, context) => {
			// Rollback on error
			if (context?.previous) {
				queryClient.setQueryData(
					productKeys.detail(variables.id),
					context.previous
				)
			}
		},
	})
}
```

### Parallel Queries
```typescript
const productsQuery = useProducts()
const categoriesQuery = useCategories()
const reviewsQuery = useReviews()

// All fetch in parallel
const isLoading = 
	productsQuery.isLoading || 
	categoriesQuery.isLoading || 
	reviewsQuery.isLoading
```

## Troubleshooting

### Data Not Updating
- Check if cache is being invalidated after mutations
- Verify query keys match between query and invalidation
- Check staleTime configuration

### Too Many Requests
- Increase staleTime
- Use refetchOnWindowFocus: false if not needed
- Check for unnecessary query key changes

### Stale Data Showing
- Decrease staleTime
- Use refetchInterval for real-time data
- Manually refetch with query.refetch()

### Cache Not Working
- Verify query keys are stable (not recreated on each render)
- Check gcTime configuration
- Ensure QueryClientProvider wraps app

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
