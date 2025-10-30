import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Bell, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { toast } from "sonner";
import api from "../../services/api";

export const PriceAlertForm = ({
  product,
  currentLowestPrice,
  open,
  onOpenChange,
}) => {
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = parseInt(targetPrice);

    if (!price || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (price >= currentLowestPrice) {
      toast.error(
        `Target price must be lower than current lowest price (Rs. ${currentLowestPrice.toLocaleString()})`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/price-alerts", {
        productId: product._id,
        targetPrice: price,
      });

      toast.success(
        "🎉 Price alert created! We'll email you when the price drops."
      );
      onOpenChange(false);
      setTargetPrice("");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create price alert";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            Set Price Drop Alert
          </DialogTitle>
          <DialogDescription>
            Get notified via email when the price drops to your target price
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">
                  {product.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Current:{" "}
                  <span className="font-semibold text-green-600">
                    Rs. {currentLowestPrice.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="text-base">
                Target Price (PKR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  Rs.
                </span>
                <Input
                  id="targetPrice"
                  type="number"
                  placeholder="e.g., 4500"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-10 text-lg"
                  min="1"
                  max={currentLowestPrice - 1}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter a price lower than Rs.{" "}
                {currentLowestPrice.toLocaleString()}
              </p>
            </div>

            {targetPrice &&
              parseInt(targetPrice) > 0 &&
              parseInt(targetPrice) < currentLowestPrice && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    💰 You'll save{" "}
                    <span className="font-bold">
                      Rs.{" "}
                      {(
                        currentLowestPrice - parseInt(targetPrice)
                      ).toLocaleString()}
                    </span>{" "}
                    when this price is reached
                  </p>
                </div>
              )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Create Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
