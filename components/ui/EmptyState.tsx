"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
      role="status"
    >
      <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">
        {icon}
      </span>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        {description}
      </p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] inline-block"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97]"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
