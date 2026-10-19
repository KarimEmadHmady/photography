
export function LocationsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-xs">
          <div className="aspect-[16/10] bg-neutral-200" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-2/3 bg-neutral-200 rounded" />
            <div className="h-3.5 w-1/2 bg-neutral-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
