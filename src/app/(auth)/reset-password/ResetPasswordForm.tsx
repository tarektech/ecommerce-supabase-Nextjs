"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseAuth } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ message }: { message: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      // Get the current URL to build the redirect URL
      const origin = window.location.origin;
      // The redirectTo should be the change password page
      const redirectTo = `${origin}/reset-password/update`;

      // According to Supabase docs: resetPasswordForEmail sends a reset password email
      const { error } = await supabaseAuth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast.success("Password reset email sent! Check your inbox.");

      // Redirect to a page that explains the user should check their email
      setTimeout(() => {
        router.push(
          "/reset-password/update?email=" + encodeURIComponent(email),
        );
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while sending the password reset email";
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-primary/15 text-primary rounded-md p-3 text-sm">
            {message}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
            We&apos;ve sent you an email with a link to reset your password.
            Please check your inbox. You&apos;ll be redirected to the password
            update page.
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          type="submit"
          className="hover:bg-primary/90 w-full cursor-pointer"
          disabled={loading || success}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link
            href="/signin"
            className="text-primary hover:text-primary/90 cursor-pointer underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
