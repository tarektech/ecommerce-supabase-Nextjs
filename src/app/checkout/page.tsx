import { getAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckoutRedirect from "@/app/checkout/CheckoutRedirect";

// This is a Server Component by default, no need for 'use client'
export default async function CheckoutPage() {
	// Get authenticated user (server-side)
	const user = await getAuthenticatedUser();

	// Redirect to sign-in if not authenticated
	if (!user) {
		redirect("/signin");
	}

	return <CheckoutRedirect />;
}
