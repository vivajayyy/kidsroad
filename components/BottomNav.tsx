"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  { href: "/", icon: "explore", label: "탐색" },
  { href: "/?view=map", icon: "map", label: "지도" },
  { href: "/my", icon: "person", label: "마이" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && searchParams.get("view") !== "map";
    if (href === "/?view=map") return pathname === "/" && searchParams.get("view") === "map";
    return pathname === href;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1E1E1E] border-t border-gray-100 dark:border-gray-800 shadow-bottom-nav safe-area-bottom"
      aria-label="하단 내비게이션"
    >
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center gap-1 flex-1 group"
              aria-label={tab.label}
            >
              <span
                className={`material-symbols-outlined text-2xl transition-colors ${
                  active
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"
                }`}
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                    : undefined
                }
              >
                {tab.icon}
              </span>
              <span
                className={`text-xs transition-colors ${
                  active
                    ? "font-semibold text-gray-900 dark:text-white"
                    : "font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
