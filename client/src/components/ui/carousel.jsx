import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

function Carousel({ children, className, itemsPerView, ...props }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const totalItems = React.Children.count(children);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerView >= totalItems ? 0 : prevIndex + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? Math.max(0, totalItems - itemsPerView)
        : prevIndex - itemsPerView
    );
  };

  const canGoNext = currentIndex + itemsPerView < totalItems;
  const canGoPrev = currentIndex > 0;

  return (
    <div
      data-slot="carousel"
      className={cn("relative w-full", className)}
      {...props}
    >
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4 py-4"
          style={{
            transform: `translateX(-${(currentIndex / totalItems) * 100}%)`,
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              style={{ width: `${100 / 4.17}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {canGoPrev && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 cursor-pointer top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {canGoNext && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 cursor-pointer top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export { Carousel };
