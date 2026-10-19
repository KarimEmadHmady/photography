import { shell, container } from './constants';

export function LocationSkeleton() {
  return (
    <div className={shell}>
      <div className={`${container} space-y-6 sm:space-y-8 animate-pulse pb-12`}>
        <div className="h-4 w-48 bg-neutral-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-72 sm:h-96 rounded-2xl bg-neutral-200" />
          <div className="lg:col-span-5 space-y-3 bg-white p-6 rounded-2xl border border-neutral-200">
            <div className="h-7 w-3/4 bg-neutral-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-neutral-100 rounded" />
            <div className="h-32 bg-neutral-100 rounded-xl mt-4" />
            <div className="h-11 bg-amber-200/70 rounded-xl mt-4" />
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <div className="h-6 w-52 bg-neutral-200 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-64 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
