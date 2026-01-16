// components/LoadingSkeleton.tsx
// This is a generic skeleton component, safe to be used in client components.

export default function LoadingSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-8">
      {/* 환영 인사 섹션의 스켈레톤 */}
      <div className="pt-8 mb-10">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>

      {/* 이벤트 카드 스켈레톤 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 p-8 rounded-xl shadow-sm animate-pulse"
          >
            <div className="flex justify-between items-start mb-12">
              <div className="h-5 bg-gray-200 rounded-full w-1/4"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
