"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string;
}

const DRAG_THRESHOLD = 100;

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  maxHeight = "85vh",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startYRef.current;
    // 아래로만 드래그 허용
    if (deltaY > 0) {
      currentYRef.current = deltaY;
      setTranslateY(deltaY);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (currentYRef.current > DRAG_THRESHOLD) {
      onClose();
    }
    setTranslateY(0);
    currentYRef.current = 0;
  }, [onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-panel safe-area-bottom"
        style={{
          maxHeight,
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar px-6 pb-6" style={{ maxHeight: `calc(${maxHeight} - 40px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
