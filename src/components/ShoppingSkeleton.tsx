import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export default function ShoppingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Link href="/" className="text-primary flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Link>
        <h1 className="ml-4 text-3xl font-bold">Your Shopping Cart</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {[1, 2].map((i) => (
            <Card key={i} className="mb-4">
              <div className="flex flex-col sm:flex-row">
                <div className="p-4 sm:w-1/4">
                  <Skeleton className="h-36 w-full" />
                </div>
                <CardContent className="flex-1 p-4">
                  <Skeleton className="mb-2 h-8 w-3/4" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-4 h-6 w-24" />
                  <div className="mt-4 flex items-center">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="mx-3 h-6 w-6" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="ml-4 h-9 w-9 rounded-md" />
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between border-t pt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
