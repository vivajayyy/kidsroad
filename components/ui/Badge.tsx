"use client";

interface BadgeProps {
  variant?: "age" | "free" | "dday" | "default";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  age: "bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm",
  free: "bg-secondary-50 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300",
  dday: "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300",
  default:
    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
