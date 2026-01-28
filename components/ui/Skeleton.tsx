"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect" | "card";
}

const variantStyles: Record<string, string> = {
  text: "h-4 w-full rounded",
  circle: "h-10 w-10 rounded-full",
  rect: "h-20 w-full rounded-lg",
  card: "h-64 w-full rounded-card",
};

export default function Skeleton({
  className = "",
  variant = "rect",
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`shimmer ${variantStyles[variant]} ${className}`}
    />
  );
}
