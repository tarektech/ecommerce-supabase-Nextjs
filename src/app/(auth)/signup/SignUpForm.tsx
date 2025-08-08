"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/hooks/useAuthForm";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  const {
    formData,
    loading,
    error,
    showPassword,
    showConfirmPassword,
    handleChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleSubmit,
  } = useAuthForm({isSignUp: true});
  return (
    

    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
            {error}
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
          <Label htmlFor="password">Password</Label>
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground absolute top-0 right-0 inline-flex h-full cursor-pointer items-center justify-center px-3"
              onClick={toggleConfirmPasswordVisibility}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"}
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
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
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
