import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Star, User, Calendar, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useProductReviews,
  useReviewStats,
  useAddReview,
  useDeleteReview,
} from "../../hooks/useReviews";
import { useAuth } from "../../contexts/AuthContext";
import AddReviewForm from "./AddReviewForm";

const ReviewsSection = ({ productId }) => {
  const { user } = useAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useProductReviews(productId, { page: currentPage, limit: 5 });
  const { data: stats, isLoading: statsLoading } = useReviewStats(productId);
  const addReviewMutation = useAddReview();
  const deleteReviewMutation = useDeleteReview();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (reviewsLoading || statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading reviews...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviewsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to load reviews</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card size="sm" className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Rating
            </CardTitle>
            {user ? (
              <Button
                onClick={() => setShowAddReview(!showAddReview)}
                variant="outline"
                size="sm"
              >
                Write a Review
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = "/login")}
                variant="outline"
                size="sm"
              >
                Login to Review
              </Button>
            )}
          </div>

          {stats && (
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalReviews} review
                  {stats.totalReviews !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalReviews > 0
                              ? (stats.ratingDistribution[rating] /
                                  stats.totalReviews) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">
                      {stats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        {showAddReview && (
          <CardContent className="pt-0">
            <AddReviewForm
              productId={productId}
              onReviewAdded={() => setShowAddReview(false)}
              onCancel={() => setShowAddReview(false)}
              isSubmitting={addReviewMutation.isPending}
            />
          </CardContent>
        )}
      </Card>

      {reviewsData &&
        reviewsData.reviews.length > 0 &&
        (() => {
          const currentUserId = user?._id;

          const sortedReviews = [...reviewsData.reviews].sort((a, b) => {
            const aUserId = a.user?._id?.toString();
            const bUserId = b.user?._id?.toString();
            const aIsCurrentUser =
              currentUserId && aUserId === currentUserId.toString();
            const bIsCurrentUser =
              currentUserId && bUserId === currentUserId.toString();

            if (aIsCurrentUser && !bIsCurrentUser) return -1;
            if (!aIsCurrentUser && bIsCurrentUser) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          const handleDeleteReview = async (reviewId) => {
            if (
              !window.confirm("Are you sure you want to delete your review?")
            ) {
              return;
            }

            try {
              await deleteReviewMutation.mutateAsync(reviewId);
              toast.success("Review deleted successfully");
            } catch (error) {
              toast.error(error.message || "Failed to delete review");
            }
          };

          return (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sortedReviews.map((review) => {
                  const reviewUserId = review.user?._id?.toString();
                  const isCurrentUserReview =
                    currentUserId && reviewUserId === currentUserId.toString();
                  const displayName = isCurrentUserReview
                    ? review.user?.fullName || "You"
                    : "Anonymous";
                  const displayEmail =
                    isCurrentUserReview && review.user?.email
                      ? `(${review.user.email})`
                      : "";

                  return (
                    <div
                      key={review._id}
                      className={`border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 ${
                        isCurrentUserReview
                          ? "bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4 -mx-4"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCurrentUserReview
                                ? "bg-green-200 dark:bg-green-800"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            <User
                              className={`w-5 h-5 ${
                                isCurrentUserReview
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">
                                {displayName} {displayEmail}
                              </span>
                              {isCurrentUserReview && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-green-500 text-green-600"
                                >
                                  Your Review
                                </Badge>
                              )}
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating, "w-3 h-3")}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {review.rating}/5
                              </Badge>
                            </div>
                            {isCurrentUserReview && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReview(review._id)}
                                disabled={deleteReviewMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {reviewsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground px-2">
                      Page {reviewsData.currentPage} of {reviewsData.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(reviewsData.totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage === reviewsData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

      {reviewsData && reviewsData.reviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your experience with this product!
            </p>
            {user ? (
              <Button onClick={() => setShowAddReview(true)}>
                Write the First Review
              </Button>
            ) : (
              <Button onClick={() => (window.location.href = "/login")}>
                Login to Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewsSection;
