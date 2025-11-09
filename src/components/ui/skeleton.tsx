import React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;


export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  );
}

// Specialized skeleton components for the NFT registration system

export function WalletSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in-0 duration-500">
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function BiometricSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 delay-200">
      {/* Camera preview skeleton */}
      <div className="relative">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-24 rounded-lg" />
      </div>

      {/* Status indicator */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3 mx-auto" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export function DocumentSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in-0 duration-500 delay-300">
      {/* Upload area skeleton */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>

      {/* File preview skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function SigningSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 delay-400">
      {/* Message preview */}
      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Sign button */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Progress indicator */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 flex-1" />
      </div>
    </div>
  );
}

export function SubmissionSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 delay-500">
      {/* Progress steps */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center space-x-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in-0 duration-500">
      {[1, 2, 3].map((item) => (
        <div key={item} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
