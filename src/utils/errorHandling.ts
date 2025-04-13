import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const ErrorCodes = {
  NO_ROWS_RETURNED: 'PGRST116',
  RLS_VIOLATION: '42501',
};

/**
 * Check if error is a "No rows returned" error
 */
export function isNoRowsError(error: PostgrestError | null): boolean {
  return error?.code === ErrorCodes.NO_ROWS_RETURNED;
}

/**
 * Check if error is a Row Level Security violation
 */
export function isRLSViolationError(error: PostgrestError | null): boolean {
  return error?.code === ErrorCodes.RLS_VIOLATION;
}

/**
 * Check if the error is related to profile not existing or RLS blocking access
 */
export function isProfileAccessError(error: PostgrestError | null): boolean {
  return isNoRowsError(error) || isRLSViolationError(error);
}

/**
 * Handle common database errors
 * @returns boolean indicating if the error was handled
 */
export function handleCommonErrors(
  error: unknown,
  options: {
    context?: string;
    showToast?: boolean;
    silentOnNoRows?: boolean;
  } = {}
): boolean {
  const {
    context = 'operation',
    showToast = true,
    silentOnNoRows = true,
  } = options;

  if (!error) return false;

  // Handle PostgrestError
  if (isPostgrestError(error)) {
    if (isNoRowsError(error)) {
      if (!silentOnNoRows) {
        console.warn(`No rows returned for ${context}`);
        if (showToast) toast.error(`No data found.`);
      }
      return true;
    }

    if (isRLSViolationError(error)) {
      console.error(`RLS violation in ${context}:`, error);
      if (showToast) {
        toast.error('Permission denied to access this data.');
      }
      return true;
    }

    // Generic Postgrest error
    console.error(`Database error in ${context}:`, error);
    if (showToast) toast.error(`Database error: ${error.message}`);
    return true;
  }

  // Handle other error types
  if (error instanceof Error) {
    console.error(`Error in ${context}:`, error);
    if (showToast) toast.error(error.message || 'An error occurred');
    return true;
  }

  // Unknown error format
  console.error(`Unknown error in ${context}:`, error);
  if (showToast) toast.error('An unexpected error occurred');
  return true;
}

/**
 * Type guard to check if an error is a PostgrestError
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

/**
 * Log an error with context but don't display to user
 */
export function logError(context: string, error: unknown): void {
  console.error(`Error in ${context}:`, error);
}

/**
 * Safe function wrapper that handles common errors
 */
export async function trySafe<T>(
  fn: () => Promise<T>,
  options: {
    context?: string;
    showToast?: boolean;
    fallbackValue?: T;
  }
): Promise<T | null> {
  const {
    context = 'operation',
    showToast = true,
    fallbackValue = null,
  } = options;

  try {
    return await fn();
  } catch (error) {
    handleCommonErrors(error, { context, showToast });
    return fallbackValue as T;
  }
}
