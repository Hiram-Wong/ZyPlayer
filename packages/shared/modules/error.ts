/**
 * Tries to call {@linkcode fn} throwing an exception with the {@linkcode message}
 * if an error occurs
 *
 * @example
 * // Before
 * let value;
 * try {
 *   value = someMethod();
 * } catch(e) {
 *   throw new Error('My specific message', { cause: e })
 * }
 *
 * // After
 * const value = errorException(
 *   () => someMethod(),
 *   'My specific message'
 * );
 */
export function errorException<T>(fn: () => T, message: string): T {
  try {
    return fn();
  } catch (e) {
    throw new Error(message, { cause: e });
  }
}
