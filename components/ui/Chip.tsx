"use client";

interface ChipProps {
  label: string;
  icon?: string;
  textIcon?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Chip({
  label,
  icon,
  textIcon,
  active = false,
  onClick,
  className = "",
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] ${
        active
          ? "bg-primary text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      } ${className}`}
    >
      {textIcon && (
        <span className="text-[11px] font-black tracking-tight leading-none">
          {textIcon}
        </span>
      )}
      {icon && !textIcon && (
        <span
          className="material-symbols-outlined text-lg"
          style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : undefined}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
