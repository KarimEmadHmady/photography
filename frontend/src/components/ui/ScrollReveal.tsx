'use client';

import React, { useEffect, useRef, useState } from 'react';

export type ScrollAnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'fade';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** نوع الحركة السلسة */
  animation?: ScrollAnimationType;
  /** التأخير الزمني بالمللي ثانية (لعمل Staggering بين العناصر) */
  delay?: number;
  /** مدة استمرار الحركة بالمللي ثانية */
  duration?: number;
  /** المسافة التي يتحركها العنصر بالبكسل */
  distance?: number;
  /** نسبة ظهور العنصر في الشاشة لتفعيل الحركة (0 إلى 1) */
  threshold?: number;
  /** هامش التفعيل قبل وصول العنصر (مثل '-50px 0px') */
  rootMargin?: string;
  /** هل تعمل الحركة لمرة واحدة فقط؟ الافتراضي true لتجربة مستخدم مريحة */
  once?: boolean;
  /** اسم التاج المولد (div, section, article...) */
  as?: React.ElementType;
  /** كلاسات Tailwind إضافية */
  className?: string;
}

/**
 * منحنى بيزير الفاخر (Apple / Ultra-smooth ease out quint)
 * يمنح شعوراً ناعماً وانسيابياً فائق الجودة
 */
const SMOOTH_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  distance = 32,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  once = true,
  as: Component = 'div',
  className = '',
  style,
  ...rest
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // التحقق من تفضيل تقليل الحركة لتسهيل الوصول (Accessibility)
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  // تحديد الحالة الأولية غير الظاهرة بناء على نوع الحركة
  const getInitialTransform = () => {
    switch (animation) {
      case 'fade-up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'fade-down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'fade-left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'fade-right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'zoom-in':
        return 'scale3d(0.95, 0.95, 1)';
      case 'fade':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const animationStyles: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1)' : getInitialTransform(),
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: SMOOTH_BEZIER,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform',
    backfaceVisibility: 'hidden',
    ...style,
  };

  return (
    <Component
      ref={elementRef}
      style={animationStyles}
      className={`gpu-layer ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * مكون حاوي لتوليد انيميشن متتابع (Staggered) للأطفال بشكل تلقائي
 */
export function ScrollStagger({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  animation = 'fade-up',
  duration = 800,
  className = '',
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  animation?: ScrollAnimationType;
  duration?: number;
  className?: string;
}) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          duration={duration}
          delay={initialDelay + index * staggerDelay}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}

export default ScrollReveal;
