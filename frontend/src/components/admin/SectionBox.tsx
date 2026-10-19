import React from 'react';

export default function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-3.5 sm:p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3.5">
      <h3 className="text-xs font-bold text-gray-800">{title}</h3>
      {children}
    </section>
  );
}