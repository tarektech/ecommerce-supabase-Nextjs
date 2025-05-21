import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UpdatePasswordForm } from './UpdatePasswordForm';

type UpdatePasswordProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UpdatePassword({
  searchParams,
}: UpdatePasswordProps) {
  const params = await searchParams;
  const message = params.message ? String(params.message) : null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Update Password</CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <UpdatePasswordForm message={message} />
      </Card>
    </div>
  );
}
