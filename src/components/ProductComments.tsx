'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Star,
  MessageCircle,
  ThumbsUp,
  MoreVertical,
  Trash2,
} from 'lucide-react';

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

interface ProductCommentsProps {
  productId: string;
}

export function ProductComments({ productId }: ProductCommentsProps) {
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

  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [helpfulComments, setHelpfulComments] = useState<Set<string>>(
    new Set()
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
          name: 'Current User',
          verified: false,
        },
        rating: newRating,
        comment: newComment.trim(),
        date: new Date().toISOString().split('T')[0],
        helpful: 0,
        verified_purchase: false,
      };
      setComments([comment, ...comments]);
      setNewComment('');
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
          : comment
      )
    );

    setHelpfulComments(new Set([...helpfulComments, commentId]));
  };

  const renderStars = (
    rating: number,
    interactive = false,
    size = 'w-4 h-4'
  ) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} cursor-pointer transition-colors ${
          index < (interactive ? hoveredStar || newRating : rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted fill-muted'
        }`}
        onClick={interactive ? () => setNewRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredStar(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          Customer Reviews ({comments.length})
        </h2>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating), false, 'w-6 h-6')}
              </div>
              <p className="text-muted-foreground">
                Based on {comments.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-6">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
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
          <h3 className="text-lg font-semibold text-foreground">
            Write a Review
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {renderStars(newRating, true, 'w-6 h-6')}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Your Review
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-vertical"
              maxLength={500}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {newComment.length}/500 characters
            </div>
          </div>

          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || newRating === 0}
            className="w-full sm:w-auto cursor-pointer"
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
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {getInitials(comment.user.name)}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">
                          {comment.user.name}
                        </h4>
                        {comment.user.verified && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                        {comment.verified_purchase && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {renderStars(comment.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
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
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {openDropdownId === comment.id && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed mb-3">
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
                          ? 'text-blue-600 hover:text-blue-600'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp
                        className="w-4 h-4 mr-1"
                        fill={
                          helpfulComments.has(comment.id)
                            ? 'currentColor'
                            : 'none'
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
