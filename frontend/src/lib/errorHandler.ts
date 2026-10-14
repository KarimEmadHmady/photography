// src/lib/errorHandler.ts
export function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error('Error message:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
  return { message: 'Something went wrong' };
}
