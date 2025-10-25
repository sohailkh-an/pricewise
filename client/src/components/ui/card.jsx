import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border bg-[#c0f6cb] text-card-foreground",
  {
    variants: {
      height: {
        homescreen: "h-[510px]",
      },
      size: {
        no_pad: "p-0",
        default: "p-2",
        sm: "p-4",
        lg: "p-8",
        priceComparison: "p-4",
        auth: "p-5",
      },
      background: {
        default: "bg-[#ffffff]",
        dark: "bg-[#1e1e1e]",
        priceComparison: "bg-[#fbfbfb]",
      },
    },
    defaultVariants: {
      size: "default",
      background: "default",
    },
  }
);

function Card({ className, size, height, background, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ size, height, background }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
