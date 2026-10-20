
import { ScrollReveal } from '../ui/ScrollReveal';

export function LocationsHeader() {
  return (
    <header className="text-right">
      <ScrollReveal animation="fade-down" delay={50} duration={750}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-snug">
          مواقع وجلسات التصوير
        </h1>
        <span className="mt-2 block h-1 w-10 rounded-full bg-amber-500" />
      </ScrollReveal>
      <ScrollReveal animation="fade-up" delay={180} duration={750}>
        <p className="mt-3 text-neutral-600 text-sm max-w-2xl leading-relaxed">
          تصفح أرقى الأماكن الخارجية والقاعات الفاخرة المعتمدة لتصوير جلسات العروسين وسيشن الزفاف.
        </p>
      </ScrollReveal>
    </header>
  );
}
