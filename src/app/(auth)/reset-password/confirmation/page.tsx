import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ResetPasswordConfirmation() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-100 text-green-800 text-sm p-4 rounded-md">
            <p>
              If an account exists with the email you entered, we've sent a link
              to reset your password. Please check your email and follow the
              instructions.
            </p>
            <p className="mt-2">
              The link will expire in 1 hour for security reasons.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Link href="/signin" className="w-full">
            <Button className="w-full cursor-pointer hover:bg-primary/90">
              Back to Sign In
            </Button>
          </Link>
          <div className="mt-4 text-center text-sm">
            Didn't receive the email?{' '}
            <Link
              href="/reset-password"
              className="text-primary underline cursor-pointer hover:text-primary/90"
            >
              Try again
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
