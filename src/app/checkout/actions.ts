'use server'

import { Polar } from '@polar-sh/sdk'
import { createServerSupabase, getAuthenticatedUser } from '@/lib/supabase/server'
import { ProductType } from '@/types'

const polar = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN!,
	server: 'sandbox',
})

/**
 * Get an existing Polar product for e-commerce checkouts
 * Uses POLAR_PRODUCT_ID if set, otherwise finds the first non-archived product
 */
async function getPolarProduct(): Promise<string> {
	// If product ID is explicitly provided, use it
	const productId = process.env.POLAR_PRODUCT_ID
	if (productId) {
		return productId
	}

	// Otherwise, list existing products and find one
	// When using organization token, don't pass organizationId
	const organizationId = process.env.POLAR_ORG_ID
	const listParams = organizationId ? { organizationId } : {}

	try {
		const productsIterator = await polar.products.list(listParams)

		// Iterate through pages to find first non-archived product
		for await (const page of productsIterator) {
			if (page?.result?.items) {
				const product = page.result.items.find(
					(p: { isArchived?: boolean; id?: string }) => !p.isArchived
				)

				if (product?.id) {
					return product.id
				}
			}
		}

		throw new Error('No active Polar products found. Please create a product in Polar or set POLAR_PRODUCT_ID environment variable.')
	} catch (error) {
		console.error('Error getting Polar product:', error)
		throw new Error(`Failed to get Polar product: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

export async function createPolarCheckout() {
	try {
		// Get authenticated user
		const user = await getAuthenticatedUser()
		if (!user) {
			throw new Error('Unauthorized')
		}

		// Get Supabase client
		const supabase = await createServerSupabase()

		// Get active cart
		const { data: cart, error: cartError } = await supabase
			.from('carts')
			.select('*')
			.eq('user_id', user.id)
			.eq('status', 'active')
			.single()

		if (cartError || !cart) {
			throw new Error('No active cart found')
		}

		// Get cart items with product details
		const { data: cartItems, error: itemsError } = await supabase
			.from('cart_items')
			.select(
				`
				*,
				product:products(*)
			`
			)
			.eq('cart_id', cart.id)

		if (itemsError || !cartItems || cartItems.length === 0) {
			throw new Error('Cart is empty')
		}

		// Get existing Polar product
		const polarProductId = await getPolarProduct()

		// Calculate total amount for all cart items
		let totalAmountInCents = 0
		const cartItemsData: Array<{
			product_id: string
			quantity: number
			price: number
			product_title: string
		}> = []

		for (const item of cartItems) {
			const productId = item.product_id
			const product = item.product as ProductType | null | undefined
			const itemTotalInCents = Math.round(item.price * item.quantity * 100)
			totalAmountInCents += itemTotalInCents

			cartItemsData.push({
				product_id: productId,
				quantity: item.quantity,
				price: item.price,
				product_title: product?.title || '',
			})
		}

		// Build ad-hoc prices object for Polar
		// Polar only allows ONE static price per product, so we combine all items into a single total
		// Store individual cart items in metadata as JSON for webhook processing
		const prices: Record<string, Array<{
			amountType: 'fixed'
			priceAmount: number
			priceCurrency: string
			metadata?: Record<string, string>
		}>> = {}

		// Single price entry with total amount and all items in metadata
		prices[polarProductId] = [{
			amountType: 'fixed',
			priceAmount: totalAmountInCents,
			priceCurrency: 'usd',
			metadata: {
				cart_items: JSON.stringify(cartItemsData),
				total_items: cartItems.length.toString(),
			},
		}]

		// Get base URL for redirect URLs
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

		// Create Polar checkout session
		// Use the single Polar product ID with multiple price entries
		const checkout = await polar.checkouts.create({
			products: [polarProductId], // Single Polar product ID
			prices: prices,
			externalCustomerId: user.id, // Map to Supabase user ID
			successUrl: `${baseUrl}/checkout/success?checkout_id={CHECKOUT_ID}`,
			customerEmail: user.email || undefined,
		})

		if (!checkout.url) {
			throw new Error('Failed to create checkout session')
		}

		return {
			success: true,
			checkoutUrl: checkout.url,
			checkoutId: checkout.id,
		}
	} catch (error) {
		console.error('Error creating Polar checkout:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Internal server error',
		}
	}
}

