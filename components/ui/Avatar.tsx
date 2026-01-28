"use client";

import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles: Record<string, { container: string; text: string; px: number }> = {
  sm: { container: "h-8 w-8", text: "text-xs", px: 32 },
  md: { container: "h-10 w-10", text: "text-sm", px: 40 },
  lg: { container: "h-14 w-14", text: "text-lg", px: 56 },
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const styles = sizeStyles[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={styles.px}
        height={styles.px}
        className={`${styles.container} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${styles.container} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
    >
      <span
        className={`${styles.text} font-semibold text-gray-600 dark:text-gray-300`}
      >
        {getInitial(name)}
      </span>
    </div>
  );
}
