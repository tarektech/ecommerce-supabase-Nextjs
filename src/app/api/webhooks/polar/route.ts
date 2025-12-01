import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createServerSupabase } from '@/lib/supabase/server'
import { AddressType, OrderStatus } from '@/types'

type PolarLineItem = {
	product_id?: string
	quantity?: number | string
	price_amount?: number
	price?: {
		price_amount?: number
		metadata?: {
			product_id?: string
			quantity?: string
			cart_items?: string
		}
	}
}

// Map Polar payment status to order_status enum
function mapPolarStatusToOrderStatus(polarStatus: string): OrderStatus {
	switch (polarStatus.toLowerCase()) {
		case 'paid':
			return 'processing'
		case 'pending':
			return 'pending'
		case 'failed':
		case 'canceled':
		case 'cancelled':
			return 'cancelled'
		default:
			return 'pending'
	}
}

// Verify webhook signature
function verifyWebhookSignature(
	payload: string,
	signature: string,
	secret: string
): boolean {
	const expectedSignature = createHmac('sha256', secret)
		.update(payload)
		.digest('hex')
	return signature === expectedSignature
}

export async function POST(request: NextRequest) {
	try {
		const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
		if (!webhookSecret) {
			console.error('POLAR_WEBHOOK_SECRET is not configured')
			return NextResponse.json(
				{ error: 'Webhook secret not configured' },
				{ status: 500 }
			)
		}

		// Get raw body for signature verification
		const body = await request.text()
		const signature = request.headers.get('polar-signature') || ''

		// Verify webhook signature
		if (!verifyWebhookSignature(body, signature, webhookSecret)) {
			console.error('Invalid webhook signature')
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 401 }
			)
		}

		// Parse webhook payload
		const event = JSON.parse(body)

		// Only process checkout.succeeded events
		if (event.type !== 'checkout.succeeded') {
			console.log(`Ignoring event type: ${event.type}`)
			return NextResponse.json({ received: true })
		}

		const checkout = event.data.checkout
		const customer = event.data.customer
		const lineItems = event.data.line_items || []

		if (!checkout || !customer) {
			console.error('Missing checkout or customer data')
			return NextResponse.json(
				{ error: 'Invalid webhook payload' },
				{ status: 400 }
			)
		}

		// Get Supabase client
		const supabase = await createServerSupabase()

		// Get user_id from external_customer_id (which we set to Supabase user ID)
		// Note: external_id should match the Supabase user UUID we passed in checkout creation
		const userId = customer.external_id
		if (!userId) {
			console.error('No external_id found in customer data. Expected Supabase user UUID.')
			// Could add email lookup fallback here if needed
			return NextResponse.json(
				{ error: 'User ID not found' },
				{ status: 400 }
			)
		}

		// Idempotency check: Check if order already exists
		const { data: existingOrder } = await supabase
			.from('orders')
			.select('id')
			.eq('payment_id', checkout.id)
			.eq('user_id', userId)
			.single()

		if (existingOrder) {
			console.log(`Order already exists for checkout ${checkout.id}`)
			return NextResponse.json({
				message: 'Order already processed',
				orderId: existingOrder.id,
			})
		}

		// Extract shipping address from customer data
		// Polar customer may have address fields
		const shippingAddress: Partial<AddressType> = {
			street: customer.address?.line1 || customer.address?.street || '',
			city: customer.address?.city || '',
			state: customer.address?.state || '',
			zip_code: customer.address?.postal_code || customer.address?.zip || '',
			country: customer.address?.country || 'US',
			is_default: false,
		}

		// Validate required address fields
		if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zip_code || !shippingAddress.country) {
			console.error('Missing required address fields')
			return NextResponse.json(
				{ error: 'Missing shipping address information' },
				{ status: 400 }
			)
		}

		// Create or get address
		const { data: address, error: addressError } = await supabase
			.from('addresses')
			.insert([
				{
					user_id: userId,
					street: shippingAddress.street,
					city: shippingAddress.city,
					state: shippingAddress.state || '',
					zip_code: shippingAddress.zip_code,
					country: shippingAddress.country,
					is_default: false,
				},
			])
			.select()
			.single()

		if (addressError || !address) {
			console.error('Error creating address:', addressError)
			return NextResponse.json(
				{ error: 'Failed to create address' },
				{ status: 500 }
			)
		}

		// Calculate total from line items (convert from cents to dollars)
		const total = lineItems.reduce((sum: number, item: PolarLineItem) => {
			return sum + (item.price_amount || 0) / 100
		}, 0)

		// Map Polar payment status to order status
		const orderStatus = mapPolarStatusToOrderStatus(
			checkout.payment_status || 'pending'
		)

		// Create order
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert([
				{
					user_id: userId,
					total: total,
					status: orderStatus,
					payment_id: checkout.id,
					payment_method: checkout.payment_method || 'polar',
					shipping_address_id: address.id,
				},
			])
			.select()
			.single()

		if (orderError || !order) {
			console.error('Error creating order:', orderError)
			return NextResponse.json(
				{ error: 'Failed to create order' },
				{ status: 500 }
			)
		}

		// Create order items from cart_items stored in metadata
		// Since we combine all items into a single price, extract cart_items from metadata
		let orderItems: Array<{
			order_id: number
			product_id: string
			quantity: number
			price: number
		}> = []

		// Try to get cart_items from the first line item's price metadata
		const firstLineItem = lineItems[0]
		const cartItemsJson = firstLineItem?.price?.metadata?.cart_items

		if (cartItemsJson) {
			// Parse cart items from JSON metadata
			try {
				const cartItems = JSON.parse(cartItemsJson) as Array<{
					product_id: string
					quantity: number
					price: number
					product_title: string
				}>

				orderItems = cartItems.map((cartItem) => ({
					order_id: order.id,
					product_id: cartItem.product_id,
					quantity: cartItem.quantity,
					price: cartItem.price, // Already unit price from cart
				}))
			} catch (parseError) {
				console.error('Error parsing cart_items from metadata:', parseError)
			}
		}

		// Fallback: If no cart_items in metadata, try to extract from individual line items
		// This handles legacy format or edge cases
		if (orderItems.length === 0) {
			type OrderItemResult = {
				order_id: number
				product_id: string
				quantity: number
				price: number
			} | null
			const mappedItems: OrderItemResult[] = lineItems
				.map((item: PolarLineItem): OrderItemResult => {
					const productId = item.price?.metadata?.product_id || item.product_id
					const quantity = parseInt(item.price?.metadata?.quantity || String(item.quantity) || '1', 10)
					// Calculate unit price: total price amount divided by quantity, then convert from cents to dollars
					const totalPriceInCents = item.price_amount || item.price?.price_amount || 0
					const unitPrice = (totalPriceInCents / 100) / quantity

					if (!productId) {
						console.warn('Missing product_id in line item:', item)
						return null
					}

					return {
						order_id: order.id,
						product_id: productId,
						quantity: quantity,
						price: unitPrice, // Store unit price, not total
					}
				})
			orderItems = mappedItems.filter((item): item is OrderItemResult & { order_id: number } => item !== null)
		}

		if (orderItems.length === 0) {
			console.error('No valid order items found')
			// Delete the order if no items
			await supabase.from('orders').delete().eq('id', order.id)
			return NextResponse.json(
				{ error: 'No valid order items' },
				{ status: 400 }
			)
		}

		// Insert order items
		const { error: itemsError } = await supabase
			.from('order_items')
			.insert(orderItems)

		if (itemsError) {
			console.error('Error creating order items:', itemsError)
			// Delete the order if items failed
			await supabase.from('orders').delete().eq('id', order.id)
			return NextResponse.json(
				{ error: 'Failed to create order items' },
				{ status: 500 }
			)
		}

		// Clear user's cart after successful order creation
		const { data: cart } = await supabase
			.from('carts')
			.select('id')
			.eq('user_id', userId)
			.eq('status', 'active')
			.single()

		if (cart) {
			await supabase.from('cart_items').delete().eq('cart_id', cart.id)
		}

		return NextResponse.json({
			message: 'Order created successfully',
			orderId: order.id,
		})
	} catch (error) {
		console.error('Error processing webhook:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

