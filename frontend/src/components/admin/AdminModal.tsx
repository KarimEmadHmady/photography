import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useModalLock } from '../../hooks/useModalLock';

const SIZES = {
  md: 'sm:max-w-lg max-h-[92dvh]',
  lg: 'sm:max-w-2xl max-h-[94dvh]',
} as const;

interface Props {
  title: string;
  size?: keyof typeof SIZES;
  submitting: boolean;
  submitLabel: string;
  formError: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

/** يتعمله render بس لما المودال مفتوح */
export default function AdminModal({
  title,
  size = 'md',
  submitting,
  submitLabel,
  formError,
  onClose,
  onSubmit,
  children,
}: Props) {
  useModalLock(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full ${SIZES[size]} rounded-t-3xl sm:rounded-3xl text-right shadow-2xl sm:max-h-[90vh] flex flex-col`}
      >
        {/* Header ثابت */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-8 pt-5 pb-3 sm:pt-7 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-10 h-10 -ml-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1">
          {/* المحتوى بيسكرول */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-4">
            {formError && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}
            {children}
          </div>

          {/* الأزرار ثابتة تحت */}
          <div className="shrink-0 px-5 sm:px-8 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6 flex items-center gap-3 border-t border-gray-100 bg-white rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm sm:text-xs font-medium hover:bg-gray-50 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] sm:flex-none px-5 py-3 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm sm:text-xs shadow-xs transition disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}