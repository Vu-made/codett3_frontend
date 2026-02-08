import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md",
        className
      )}
      {...props}
    />
  );
}
