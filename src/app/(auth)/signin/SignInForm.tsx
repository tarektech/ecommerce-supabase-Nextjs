"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";

export function SignInForm({ message }: { message: string | null }) {
  const {
    formData,
    loading,
    error,
    showPassword,
    handleChange,
    togglePasswordVisibility,
    handleSubmit,
  } = useAuthForm();

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
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password"
              className="text-primary text-sm underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground absolute top-0 right-0 inline-flex h-full cursor-pointer items-center justify-center px-3"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          type="submit"
          className="hover:bg-primary/90 w-full cursor-pointer"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/90 cursor-pointer underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
