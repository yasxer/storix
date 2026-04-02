export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-64 bg-gray-100 rounded-md mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>

      {/* Content Skeleton */}
      <div className="bg-white border flex flex-col border-[var(--color-border)] rounded-lg shadow-sm mt-4 p-6 space-y-4">
        <div className="h-8 w-full bg-gray-100 rounded-md"></div>
        <div className="h-8 w-full bg-gray-100 rounded-md"></div>
        <div className="h-8 w-full bg-gray-100 rounded-md"></div>
        <div className="h-8 w-full bg-gray-100 rounded-md"></div>
        <div className="h-8 w-full bg-gray-100 rounded-md"></div>
      </div>
    </div>
  )
}
