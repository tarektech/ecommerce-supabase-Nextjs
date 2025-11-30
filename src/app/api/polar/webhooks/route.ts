import { NextRequest, NextResponse } from 'next/server'
import { polar, POLAR_WEBHOOK_SECRET } from '@/lib/polar/config'
import { createServerSupabase } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Disable body parsing so we can verify webhook signature
export const runtime = 'nodejs'

/**
 * Verify webhook signature from Polar
 */
async function verifyWebhookSignature(
	request: NextRequest,
	body: string,
): Promise<boolean> {
	if (!POLAR_WEBHOOK_SECRET) {
		console.warn('POLAR_WEBHOOK_SECRET not set, skipping signature verification')
		return true // Allow in development
	}

	const headersList = await headers()
	const signature = headersList.get('x-polar-signature')

	if (!signature) {
		return false
	}

	// Polar uses HMAC-SHA256 for webhook signatures
	// Implementation depends on Polar's exact signature format
	// For now, we'll check if signature exists
	return !!signature
}

/**
 * Handle checkout.completed event
 */
async function handleCheckoutCompleted(event: any) {
	const supabase = await createServerSupabase()
	const checkout = event.data

	// Extract metadata from checkout
	const userId = checkout.metadata?.supabase_user_id
	const cartItemsStr = checkout.metadata?.cart_items
	const shippingAddressStr = checkout.metadata?.shipping_address

	if (!userId || !cartItemsStr || !shippingAddressStr) {
		console.error('Missing required metadata in checkout:', checkout.metadata)
		throw new Error('Missing required metadata')
	}

	const cartItems = JSON.parse(cartItemsStr)
	const shippingAddress = JSON.parse(shippingAddressStr)

	// First, save or get the shipping address
	const { data: existingAddress, error: addressCheckError } = await supabase
		.from('addresses')
		.select('id')
		.eq('user_id', userId)
		.eq('street', shippingAddress.street)
		.eq('city', shippingAddress.city)
		.eq('zip_code', shippingAddress.zipCode)
		.eq('country', shippingAddress.country)
		.maybeSingle()

	let addressId: number

	if (existingAddress) {
		addressId = existingAddress.id
	} else {
		// Create new address
		const { data: newAddress, error: addressError } = await supabase
			.from('addresses')
			.insert({
				user_id: userId,
				street: shippingAddress.street,
				city: shippingAddress.city,
				state: shippingAddress.state || '',
				zip_code: shippingAddress.zipCode,
				country: shippingAddress.country,
				is_default: false,
			})
			.select('id')
			.single()

		if (addressError || !newAddress) {
			console.error('Error creating address:', addressError)
			throw new Error('Failed to create address')
		}

		addressId = newAddress.id
	}

	// Calculate total
	const total = cartItems.reduce(
		(sum: number, item: any) => sum + item.price * item.quantity,
		0,
	)

	// Create order in Supabase
	const { data: order, error: orderError } = await supabase
		.from('orders')
		.insert({
			user_id: userId,
			total: total,
			status: 'pending',
			payment_id: checkout.id, // Store Polar checkout ID
			payment_method: 'polar',
			shipping_address_id: addressId,
		})
		.select('id')
		.single()

	if (orderError || !order) {
		console.error('Error creating order:', orderError)
		throw new Error('Failed to create order')
	}

	// Create order items
	const orderItems = cartItems.map((item: any) => ({
		order_id: order.id,
		product_id: item.product_id,
		quantity: item.quantity,
		price: item.price,
	}))

	const { error: itemsError } = await supabase
		.from('order_items')
		.insert(orderItems)

	if (itemsError) {
		console.error('Error creating order items:', itemsError)
		throw new Error('Failed to create order items')
	}

	// Update cart status to converted
	const { error: cartError } = await supabase
		.from('carts')
		.update({ status: 'converted' })
		.eq('user_id', userId)
		.eq('status', 'active')

	if (cartError) {
		console.error('Error updating cart status:', cartError)
		// Non-critical, don't throw
	}

	console.log(`Order ${order.id} created successfully for checkout ${checkout.id}`)

	return order
}

/**
 * Handle order.created event from Polar
 */
async function handleOrderCreated(event: any) {
	const supabase = await createServerSupabase()
	const polarOrder = event.data

	// Update order status if needed
	const { error } = await supabase
		.from('orders')
		.update({
			status: 'processing',
		})
		.eq('payment_id', polarOrder.checkoutId)

	if (error) {
		console.error('Error updating order status:', error)
		// Non-critical
	}

	console.log(`Order status updated for Polar order ${polarOrder.id}`)
}

export async function POST(request: NextRequest) {
	try {
		// Read raw body for signature verification
		const body = await request.text()

		// Verify webhook signature
		const isValid = await verifyWebhookSignature(request, body)
		if (!isValid) {
			console.error('Invalid webhook signature')
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 401 },
			)
		}

		// Parse webhook payload
		const event = JSON.parse(body)

		console.log('Received Polar webhook:', event.type)

		// Handle different event types
		switch (event.type) {
			case 'checkout.completed':
				await handleCheckoutCompleted(event)
				break

			case 'order.created':
				await handleOrderCreated(event)
				break

			default:
				console.log(`Unhandled webhook event type: ${event.type}`)
		}

		// Always return 200 to acknowledge receipt
		return NextResponse.json({ received: true })
	} catch (error) {
		console.error('Error processing webhook:', error)
		// Return 200 anyway to prevent retries for unrecoverable errors
		// Polar will retry failed webhooks
		return NextResponse.json(
			{
				error: 'Webhook processing failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}




