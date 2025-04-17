import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export default function ShoppingSkeleton() {
    return (
        <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold ml-4">Your Shopping Cart</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {[1, 2].map((i) => (
              <Card key={i} className="mb-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/4 p-4">
                    <Skeleton className="h-36 w-full" />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="flex items-center mt-4">
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-6 w-6 mx-3" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md ml-4" />
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
                  <div className="flex justify-between pt-4 border-t">
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
    )
}
