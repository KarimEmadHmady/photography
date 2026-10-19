import React from 'react';
import { container, SectionHeading } from './HomeCommon';

const steps = [
  {
    title: 'اختر مكان التصوير',
    desc: 'تصفح صور الأماكن والقاعات في المناطق المختلفة واختر الأنسب لذوقك.',
  },
  {
    title: 'اطلع على الأسعار',
    desc: 'تعرف على أسعار التصوير وحجز المكان بشفافية تامة وبدون تكاليف مخفية.',
  },
  {
    title: 'تواصل مباشرة',
    desc: 'تواصل مع المصور عبر واتساب أو الهاتف لتحديد الموعد المناسب.',
  },
  {
    title: 'وثق أجمل اللحظات',
    desc: 'عش تجربة تصوير مريحة واحترافية واستلم صورك بأعلى جودة.',
  },
];

export function HomeHowItWorks() {
  return (
    <section className="content-auto bg-white py-10 lg:py-14">
      <div className={container}>
        <SectionHeading
          align="center"
          title="كيف تنسق جلسة تصويرك؟"
          subtitle="أربع خطوات بسيطة من الاختيار حتى استلام الصور."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 text-right space-y-2"
            >
              <span className="w-9 h-9 rounded-full bg-neutral-900 text-amber-400 text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <h3 className="font-bold text-base text-neutral-900">{item.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
