import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp, Flag } from "lucide-react";

interface ReviewSystemProps {
  reviews: any[];
  propertyId?: string;
  serviceProviderId?: string;
  canReview: boolean;
}

export default function ReviewSystem({ reviews, propertyId, serviceProviderId, canReview }: ReviewSystemProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  const createReviewMutation = useMutation({
    mutationFn: async (review: any) => {
      return await apiRequest("POST", "/api/reviews", review);
    },
    onSuccess: async () => {
      toast({
        title: t("reviews.review_submitted"),
        description: "Thank you for your feedback!",
      });
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', comment: '' });
      queryClient.invalidateQueries({ 
        queryKey: propertyId ? 
          ['/api/properties', propertyId, 'reviews'] : 
          ['/api/service-providers', serviceProviderId, 'reviews'] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: t("reviews.review_failed"),
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!reviewData.title.trim() || !reviewData.comment.trim()) {
      toast({
        title: t("reviews.missing_information"),
        description: "Please provide both a title and comment for your review.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      propertyId,
      serviceProviderId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
    });
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }: { rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
            }`}
            onClick={() => !readonly && onRatingChange?.(star)}
            data-testid={`star-${star}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground" data-testid="text-reviews-title">
          Reviews ({reviews.length})
        </h2>
        {canReview && (
          <Button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            data-testid="button-write-review"
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="p-6" data-testid="card-review-form">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Write Your Review
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="mt-2">
                <StarRating 
                  rating={reviewData.rating} 
                  onRatingChange={(rating) => setReviewData(prev => ({ ...prev, rating }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">{t("reviews.review_title")}</Label>
              <Input
                id="title"
                data-testid="input-review-title"
                placeholder="Summarize your experience"
                value={reviewData.title}
                onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="comment">{t("reviews.your_review")}</Label>
              <Textarea
                id="comment"
                data-testid="textarea-review-comment"
                placeholder="Share details about your experience"
                rows={4}
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending}
                data-testid="button-submit-review"
              >
                {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review: any) => (
            <Card key={review.id} className="p-6" data-testid={`card-review-${review.id}`}>
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.reviewer?.profileImageUrl} />
                  <AvatarFallback>
                    {review.reviewer?.firstName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground" data-testid={`text-reviewer-name-${review.id}`}>
                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} readonly />
                        <span className="text-sm text-muted-foreground" data-testid={`text-review-date-${review.id}`}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" data-testid={`button-helpful-${review.id}`}>
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-report-${review.id}`}>
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {review.title && (
                    <h5 className="font-medium text-foreground mb-2" data-testid={`text-review-title-${review.id}`}>
                      {review.title}
                    </h5>
                  )}
                  
                  <p className="text-muted-foreground" data-testid={`text-review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mt-3">
                      {review.images.map((image: string, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                          data-testid={`img-review-${review.id}-${index}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-reviews-title">
              No Reviews Yet
            </h3>
            <p className="text-muted-foreground" data-testid="text-no-reviews-description">
              Be the first to share your experience!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
