export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">

      {/* Image placeholder */}
      <div className="h-40 w-full bg-gray-200 rounded-xl mb-4"></div>

      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

      {/* Description lines */}
      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>

      {/* Info rows */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Button */}
      <div className="h-10 bg-gray-200 rounded-xl"></div>
    </div>
  );
}
