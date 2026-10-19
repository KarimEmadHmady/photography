export type PublishStatus = 'draft' | 'published';

export default function StatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
        status === 'published'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {status === 'published' ? 'منشور' : 'مسودة'}
    </span>
  );
}