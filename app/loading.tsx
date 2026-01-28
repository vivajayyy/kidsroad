export default function Loading() {
  return (
    <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 히어로 스켈레톤 */}
      <section className="pt-8 pb-4 md:pt-12 md:pb-6">
        <div className="h-8 w-72 shimmer rounded mb-3" />
        <div className="h-5 w-56 shimmer rounded" />
      </section>

      {/* 캐러셀 스켈레톤 */}
      <div className="flex gap-4 overflow-hidden py-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-none w-72 h-36 shimmer rounded-2xl" />
        ))}
      </div>

      {/* 필터 스켈레톤 */}
      <div className="space-y-4 mb-8">
        <div className="h-12 shimmer rounded-full" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-20 shimmer rounded-full" />
          ))}
        </div>
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="aspect-[16/10] shimmer" />
            <div className="p-6 space-y-3">
              <div className="h-5 w-3/4 shimmer rounded" />
              <div className="h-4 w-1/2 shimmer rounded" />
              <div className="h-4 w-2/3 shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
