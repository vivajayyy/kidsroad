"use client";

interface SegmentedOption {
  value: string;
  label: string;
  icon?: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary ${
            value === option.value
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {option.icon && (
            <span className="material-symbols-outlined text-lg">
              {option.icon}
            </span>
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}
