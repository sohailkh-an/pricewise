import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Star } from "lucide-react";
import { useAddReview } from "../../hooks/useReviews";

const AddReviewForm = ({
  productId,
  onReviewAdded,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
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

    if (!formData.userName.trim()) {
      newErrors.userName = "Name is required";
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Please enter a valid email";
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Review comment is required";
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = "Review must be at least 10 characters long";
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
      await addReviewMutation.mutateAsync({
        productId,
        ...formData,
      });

      setFormData({
        userName: "",
        userEmail: "",
        rating: 5,
        comment: "",
      });

      onReviewAdded();
    } catch (error) {
      setErrors({
        submit: error.message || "Failed to submit review. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userName">Your Name *</Label>
          <Input
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="Enter your name"
            className={errors.userName ? "border-red-500" : ""}
          />
          {errors.userName && (
            <p className="text-sm text-red-500">{errors.userName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userEmail">Your Email *</Label>
          <Input
            id="userEmail"
            name="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className={errors.userEmail ? "border-red-500" : ""}
          />
          {errors.userEmail && (
            <p className="text-sm text-red-500">{errors.userEmail}</p>
          )}
        </div>
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
