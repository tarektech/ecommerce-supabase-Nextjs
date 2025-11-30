import { NextRequest, NextResponse } from "next/server";
import { polar } from "@/lib/polar/config";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = 'nodejs'

interface CheckoutItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
}

interface CheckoutRequestBody {
  items: CheckoutItem[];
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
  };
  customerEmail?: string;
}


// const productId = process.env.POLAR_PRODUCT_ID;

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: CheckoutRequestBody = await request.json();
    const { items, shippingAddress, customerEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 },
      );
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Create checkout session with Polar
    // IMPORTANT: You must create products in Polar dashboard first
    // For sandbox testing, use a demo product ID from your Polar dashboard
    // In production, you would map each cart item to its corresponding Polar product ID

    // For demo purposes, we'll use a single product checkout
    // Replace 'DEMO_PRODUCT_ID' with an actual product ID from your Polar sandbox
    const polarProductId =
      process.env.POLAR_DEMO_PRODUCT_ID || "REPLACE_WITH_YOUR_PRODUCT_ID";

    const checkoutSession = await polar.checkouts.create({
      products: [polarProductId], // Required: Array of Polar product IDs
      amount: Math.round(totalAmount * 100), // Optional: Custom amount in cents
      successUrl: `${request.nextUrl.origin}/checkout/confirmation?session_id={CHECKOUT_ID}`,
      customerEmail: customerEmail || user.email || undefined,
      // Store metadata for webhook processing
      metadata: {
        supabase_user_id: user.id,
        total_amount: totalAmount.toString(),
        cart_items: JSON.stringify(
          items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
          })),
        ),
        shipping_address: JSON.stringify(shippingAddress),
      },
    });

    return NextResponse.json({
      checkoutId: checkoutSession.id,
      clientSecret: checkoutSession.clientSecret,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error creating Polar checkout:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
