// app/loading.tsx
export default function Loading() {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 환영 인사 섹션의 스켈레톤 */}
      <section className="py-8 md:py-16 text-center md:text-left animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto md:mx-0 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto md:mx-0"></div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 이벤트 카드 스켈레톤 (5개) */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="relative w-full aspect-[4/3] bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
