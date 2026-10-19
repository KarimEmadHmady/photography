import { Star } from 'lucide-react';

export default function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
      <Star className="w-2.5 h-2.5 fill-current" />
      مميز
    </span>
  );
}