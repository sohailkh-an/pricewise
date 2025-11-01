import * as React from "react";
import { Card } from "./card";

function ProductCardSkeleton() {
  return (
    <Card
      size="no_pad"
      height="homescreen"
      className="flex flex-col h-full"
    >
      <div className="p-4 pb-0 shrink-0 flex flex-col h-full">
        {/* Image skeleton */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
          <div className="w-full h-full shimmer-skeleton" />
        </div>

        {/* Badges and Rating skeleton */}
        <div className="flex items-center justify-between gap-2 mb-2 min-h-[24px]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-5 w-16 rounded-full shimmer-skeleton" />
            <div className="h-5 w-20 rounded-full shimmer-skeleton" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-16 rounded shimmer-skeleton" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="mb-2 h-[56px] flex flex-col gap-2">
          <div className="h-5 w-full rounded shimmer-skeleton" />
          <div className="h-5 w-3/4 rounded shimmer-skeleton" />
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Button skeleton */}
        <div className="p-4 pt-0 mt-auto shrink-0">
          <div className="h-10 w-full rounded-md shimmer-skeleton" />
        </div>
      </div>
    </Card>
  );
}

export { ProductCardSkeleton };

