"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MessageCircle,
  ThumbsUp,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Image from "next/image";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified_purchase?: boolean;
}

export function ProductComments() {
  const [comments, setComments] = useState<Comment[]>([
    // {
    //   id: '1',
    //   user: {
    //     name: 'Sarah Johnson',
    //     avatar: '/api/placeholder/40/40',
    //     verified: true,
    //   },
    //   rating: 5,
    //   comment:
    //     'Amazing product! The quality is exceptional and it arrived exactly as described. Highly recommend to anyone looking for premium quality.',
    //   date: '2024-01-15',
    //   helpful: 12,
    //   verified_purchase: true,
    // },
    // {
    //   id: '2',
    //   user: {
    //     name: 'Mike Chen',
    //     avatar: '/api/placeholder/40/40',
    //   },
    //   rating: 4,
    //   comment:
    //     'Good value for money. The product works well and shipping was fast. Only minor issue was the packaging could be better.',
    //   date: '2024-01-10',
    //   helpful: 8,
    //   verified_purchase: true,
    // },
    // {
    //   id: '3',
    //   user: {
    //     name: 'Emma Wilson',
    //     verified: true,
    //   },
    //   rating: 5,
    //   comment:
    //     'Perfect! Exceeded my expectations. The attention to detail is remarkable and customer service was excellent.',
    //   date: '2024-01-08',
    //   helpful: 15,
    //   verified_purchase: true,
    // },
  ]);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [helpfulComments, setHelpfulComments] = useState<Set<string>>(
    new Set(),
  );

  const averageRating =
    comments.reduce((acc, comment) => acc + comment.rating, 0) /
    comments.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: comments.filter((comment) => comment.rating === rating).length,
    percentage:
      (comments.filter((comment) => comment.rating === rating).length /
        comments.length) *
      100,
  }));

  const handleSubmitComment = () => {
    if (newComment.trim() && newRating > 0) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: "Current User",
          verified: false,
        },
        rating: newRating,
        comment: newComment.trim(),
        date: new Date().toISOString().split("T")[0],
        helpful: 0,
        verified_purchase: false,
      };
      setComments([comment, ...comments]);
      setNewComment("");
      setNewRating(0);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
    setOpenDropdownId(null);
  };

  const toggleDropdown = (commentId: string) => {
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  const handleHelpful = (commentId: string) => {
    if (helpfulComments.has(commentId)) return; // Prevent multiple votes

    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, helpful: comment.helpful + 1 }
          : comment,
      ),
    );

    setHelpfulComments(new Set([...helpfulComments, commentId]));
  };

  const renderStars = (
    rating: number,
    interactive = false,
    size = "w-4 h-4",
  ) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} cursor-pointer transition-colors ${
          index < (interactive ? hoveredStar || newRating : rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted fill-muted"
        }`}
        onClick={interactive ? () => setNewRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredStar(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="text-primary h-6 w-6" />
        <h2 className="text-foreground text-2xl font-bold">
          Customer Reviews ({comments.length})
        </h2>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-foreground mb-2 text-4xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2 flex justify-center">
                {renderStars(Math.round(averageRating), false, "w-6 h-6")}
              </div>
              <p className="text-muted-foreground">
                Based on {comments.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-foreground w-6 text-sm">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Review Form */}
      <Card>
        <CardHeader>
          <h3 className="text-foreground text-lg font-semibold">
            Write a Review
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Rating
            </label>
            <div className="flex gap-1">
              {renderStars(newRating, true, "w-6 h-6")}
            </div>
          </div>

          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Your Review
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring resize-vertical min-h-[100px] w-full rounded-md border p-3 focus:ring-1 focus:outline-none"
              maxLength={500}
            />
            <div className="text-muted-foreground mt-1 text-sm">
              {newComment.length}/500 characters
            </div>
          </div>

          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || newRating === 0}
            className="w-full cursor-pointer sm:w-auto"
          >
            Submit Review
          </Button>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user.avatar ? (
                    <Image
                      src={comment.user.avatar || ""}
                      alt={comment.user.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                      {getInitials(comment.user.name)}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-foreground font-medium">
                          {comment.user.name}
                        </h4>
                        {comment.user.verified && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                            Verified
                          </span>
                        )}
                        {comment.verified_purchase && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex">
                          {renderStars(comment.rating)}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => toggleDropdown(comment.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {openDropdownId === comment.id && (
                        <div className="bg-background border-border absolute top-full right-0 z-10 mt-1 min-w-[120px] rounded-md border shadow-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full cursor-pointer justify-start"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-foreground mb-3 leading-relaxed">
                    {comment.comment}
                  </p>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(comment.id)}
                      disabled={helpfulComments.has(comment.id)}
                      className={`cursor-pointer ${
                        helpfulComments.has(comment.id)
                          ? "text-blue-600 hover:text-blue-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ThumbsUp
                        className="mr-1 h-4 w-4"
                        fill={
                          helpfulComments.has(comment.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                      Helpful ({comment.helpful})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">Load More Reviews</Button>
      </div>
    </div>
  );
}
