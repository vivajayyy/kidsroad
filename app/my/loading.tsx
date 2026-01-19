export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Profile Skeleton */}
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Bookmarks Skeleton */}
      <div>
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 p-8 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
