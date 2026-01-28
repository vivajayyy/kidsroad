"use client";

interface IconButtonProps {
  icon: string;
  ariaLabel: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "filled";
  className?: string;
  disabled?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: "p-1.5 text-lg",
  md: "p-2 text-xl",
  lg: "p-2.5 text-2xl",
};

const variantStyles: Record<string, string> = {
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  filled:
    "bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 shadow-sm",
};

export default function IconButton({
  icon,
  ariaLabel,
  onClick,
  size = "md",
  variant = "ghost",
  className = "",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
