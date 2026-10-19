import { Plus } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export default function AdminPageHeader({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm sm:text-xs shadow-xs transition shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}