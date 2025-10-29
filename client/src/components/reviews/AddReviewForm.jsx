import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Star } from "lucide-react";
import { useAddReview } from "../../hooks/useReviews";
import { useAuth } from "../../contexts/AuthContext";

const AddReviewForm = ({
  productId,
  onReviewAdded,
  onCancel,
  isSubmitting,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [errors, setErrors] = useState({});

  const addReviewMutation = useAddReview();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.comment.trim()) {
      newErrors.comment = "Review comment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data = await addReviewMutation.mutateAsync({
        productId,
        ...formData,
      });

      const newReview = data?.review || data;

      const matchingQueries = queryClient.getQueriesData({
        queryKey: ["productReviews", productId],
      });

      matchingQueries.forEach(([queryKey, cached]) => {
        if (!cached) return;
        const params = Array.isArray(queryKey) ? queryKey[2] : undefined;
        const limit = params?.limit || undefined;
        const updatedReviews = [newReview, ...(cached.reviews || [])];
        const trimmedReviews =
          typeof limit === "number"
            ? updatedReviews.slice(0, limit)
            : updatedReviews;

        queryClient.setQueryData(queryKey, {
          ...cached,
          reviews: trimmedReviews,
          totalReviews: (cached.totalReviews || 0) + 1,
        });
      });

      queryClient.setQueryData(["reviewStats", productId], (old) => {
        if (!old) return old;
        const total = (old.totalReviews || 0) + 1;
        const rating = Number(newReview?.rating) || 0;
        const sum = (old.averageRating || 0) * (old.totalReviews || 0) + rating;
        const newAvg = total > 0 ? sum / total : 0;
        const dist = { ...(old.ratingDistribution || {}) };
        dist[rating] = (dist[rating] || 0) + 1;
        return {
          ...old,
          totalReviews: total,
          averageRating: newAvg,
          ratingDistribution: dist,
        };
      });

      setFormData({
        rating: 5,
        comment: "",
      });

      onReviewAdded?.(newReview);
    } catch (error) {
      setErrors({
        submit: error.message || "Failed to submit review. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Reviewing as:</strong> {user?.name} ({user?.email})
        </p>
      </div>

      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= formData.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {formData.rating} star{formData.rating !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review *</Label>
        <Textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          placeholder="Share your experience with this product..."
          rows={4}
          maxLength={500}
          className={errors.comment ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          {errors.comment ? (
            <span className="text-red-500">{errors.comment}</span>
          ) : (
            <span>Share details about your experience</span>
          )}
          <span>{formData.comment.length}/500</span>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || addReviewMutation.isPending}
          className="flex-1"
        >
          {isSubmitting || addReviewMutation.isPending
            ? "Submitting..."
            : "Submit Review"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || addReviewMutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddReviewForm;
