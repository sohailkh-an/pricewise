import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

function Carousel({ children, className, ...props }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [itemsPerView, setItemsPerView] = React.useState(4);
  const totalItems = React.Children.count(children);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [itemsPerView]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, totalItems - itemsPerView);
      return prevIndex >= maxIndex
        ? 0
        : Math.min(prevIndex + itemsPerView, maxIndex);
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? 0 : Math.max(0, prevIndex - itemsPerView)
    );
  };

  const canGoNext = currentIndex + itemsPerView < totalItems;
  const canGoPrev = currentIndex > 0;

  const itemWidth = 100 / itemsPerView;
  const gap = 1.5;
  const translatePercent = currentIndex * itemWidth + currentIndex * gap;

  return (
    <div
      data-slot="carousel"
      className={cn("relative w-full", className)}
      {...props}
    >
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{
            transform: `translateX(-${translatePercent}%)`,
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="shrink-0"
              style={{
                width: `calc(${itemWidth}% - ${
                  (gap * (itemsPerView - 1)) / itemsPerView
                }%)`,
              }}
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 cursor-pointer
                     bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl
                     border-2 hover:border-primary transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={prevSlide}
          aria-label="Previous products"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {canGoNext && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 cursor-pointer
                     bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl
                     border-2 hover:border-primary transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={nextSlide}
          aria-label="Next products"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {totalItems > itemsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({
            length: Math.ceil(totalItems / itemsPerView),
          }).map((_, index) => {
            const dotIndex = index * itemsPerView;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(dotIndex)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  currentIndex === dotIndex
                    ? "bg-primary w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export { Carousel };
