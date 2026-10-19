import React from 'react';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}

export default function CheckRow({ checked, onChange, children }: Props) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer min-h-[44px] sm:min-h-0 text-xs text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0"
      />
      <span className="leading-relaxed">{children}</span>
    </label>
  );
}