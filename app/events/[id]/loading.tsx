export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* 상단 네비 스켈레톤 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center">
          <div className="h-5 w-12 shimmer rounded" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* 히어로 이미지 스켈레톤 */}
        <div className="w-full aspect-[16/9] shimmer" />

        {/* 콘텐츠 스켈레톤 */}
        <div className="px-4 md:px-6 py-8 space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <div className="h-8 w-3/4 shimmer rounded" />
            <div className="h-8 w-1/2 shimmer rounded" />
          </div>

          {/* 핵심 정보 */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 shimmer rounded" />
                <div className="space-y-1.5">
                  <div className="h-3 w-12 shimmer rounded" />
                  <div className="h-4 w-40 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* 체크리스트 */}
          <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl">
            <div className="h-5 w-28 shimmer rounded mb-3" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-24 shimmer rounded-full" />
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="h-5 w-20 shimmer rounded mb-3" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 shimmer rounded"
                style={{ width: `${90 - i * 10}%` }}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-6">
            <div className="flex-1 h-12 shimmer rounded-button" />
            <div className="w-12 h-12 shimmer rounded-button" />
          </div>
        </div>
      </div>
    </div>
  );
}
