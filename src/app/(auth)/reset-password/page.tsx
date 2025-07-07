import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./ResetPasswordForm";

type ResetPasswordProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPassword({
  searchParams,
}: ResetPasswordProps) {
  const params = await searchParams;
  const message = params.message ? String(params.message) : null;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <ResetPasswordForm message={message} />
      </Card>
    </div>
  );
}
