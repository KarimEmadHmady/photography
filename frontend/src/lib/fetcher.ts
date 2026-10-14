// src/lib/fetcher.ts
import { handleError } from './errorHandler';

export const fetcher = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    return handleError(error);
  }
};
