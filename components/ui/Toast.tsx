"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-slide-up flex items-center gap-2 ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            }`}
          >
            {toast.type === "success" && (
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
            )}
            {toast.type === "error" && (
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
            )}
            {toast.type === "info" && (
              <span className="material-symbols-outlined text-[18px]">
                info
              </span>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
