import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export default function AdminEmptyState({ icon: Icon, message, actionLabel, onAction }: Props) {
  return (
    <div className="text-center py-14 bg-white rounded-xl sm:rounded-2xl border border-dashed border-gray-300 space-y-3">
      <Icon className="w-10 h-10 text-gray-300 mx-auto" />
      <p className="text-sm text-gray-500">{message}</p>
      <button
        onClick={onAction}
        className="px-4 py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-lg"
      >
        {actionLabel}
      </button>
    </div>
  );
}