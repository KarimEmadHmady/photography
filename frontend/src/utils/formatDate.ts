// src/utils/formatDate.ts
export const formatDate = (date: Date | string, locale = 'en-US') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};
