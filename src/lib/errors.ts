/**
 * Simple error wrapper for consistent error handling
 */

export class AppError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

/**
 * Wraps an error in a standard format
 */
export function wrapError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, { cause: error });
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError('Unknown error occurred', { original: error });
}

/**
 * Helper for try/catch blocks that ensures errors are properly wrapped
 */
export function catchError<T>(fn: () => T): T | AppError {
  try {
    return fn();
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Async version of catchError
 */
export async function catchAsyncError<T>(fn: () => Promise<T>): Promise<T | AppError> {
  try {
    return await fn();
  } catch (error) {
    return wrapError(error);
  }
}
