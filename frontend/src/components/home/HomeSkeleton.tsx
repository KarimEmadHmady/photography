import React from 'react';
import { container } from './HomeCommon';

export function HomeSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white border-b border-neutral-200 pt-28 pb-14 lg:pt-36 lg:pb-20">
        <div className={container}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 animate-pulse">
              <div className="h-6 w-44 bg-amber-100 rounded-full" />
              <div className="h-10 w-4/5 bg-neutral-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-neutral-100 rounded-md" />
                <div className="h-4 w-2/3 bg-neutral-100 rounded-md" />
              </div>
              <div className="pt-2 flex gap-3">
                <div className="h-12 w-44 bg-amber-200/70 rounded-xl" />
                <div className="h-12 w-40 bg-neutral-200 rounded-xl" />
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5">
              <div className="aspect-4/5 max-w-[320px] mx-auto rounded-2xl bg-neutral-100 animate-pulse border-4 border-white shadow-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
