export default function Loading() {
  return (
    <div className="space-y-8">
      {/* 프로필 스켈레톤 */}
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-14 h-14 rounded-full shimmer" />
        <div className="space-y-2">
          <div className="h-5 w-40 shimmer rounded" />
          <div className="h-4 w-56 shimmer rounded" />
        </div>
      </div>

      {/* 북마크 목록 스켈레톤 */}
      <div>
        <div className="h-7 w-36 shimmer rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
    </div>
  );
}
