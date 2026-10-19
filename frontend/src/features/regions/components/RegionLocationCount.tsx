export default function RegionLocationCount({ count }: { count?: number }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px]">
      {count || 0} مكان
    </span>
  );
}