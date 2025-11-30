"use client";

import React from "react";

import { Avatar } from "@/components/ui/avatar";
import { useGetProductReviews } from "@/hooks/queries";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { useCurrentProfile } from "@/hooks/queries/use-profile";

type ReviewedCardProps = {
  productId: string;
  limit?: number;
};

export function ReviewedCard({ productId, limit }: ReviewedCardProps) {
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useGetProductReviews(productId);


  const {data: profileData} = useCurrentProfile();

  console.log(
    "reviewsError",
    reviewsError?.message,
    reviewsError?.name,
    reviewsError?.stack,
  );

  if (reviewsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviewsData?.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviewsData?.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar>
                <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                  <span className="text-sm font-medium">
                    {profileData?.avatar_url?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="font-medium">
                     {profileData?.username}
                  </h4>
                  {RenderStars(review.rating, "sm")}
                  {review.created_at && (
                    <span className="text-muted-foreground text-sm">
                      {format(new Date(review.created_at), "MMM dd, yyyy")}
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {limit && reviewsData?.length && reviewsData?.length > limit && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Showing {limit} of {reviewsData?.length || 0} reviews
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RenderStars(rating: number, size: "sm" | "md" = "md") {
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}
