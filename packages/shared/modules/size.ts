import { isPositiveFiniteNumber } from '@shared/modules/validate';

export type ISizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

export interface ISizeOption {
  unit?: ISizeUnit | 'auto';
  increment?: number;
  decimal?: number;
}

const UNITS: ISizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * Converts a byte count into a scaled value with a unit label (e.g. KB, MB, GB).
 * Automatically remove meaningless tail zeros.
 *
 * @param {number} bytes - The number of bytes.
 * @param {ISizeOption} options - Configuration options.
 * @returns {{ count: number, unit: string }} Scaled value and its corresponding unit.
 *
 * @example
 * ```javascript
 * calculateSize(512); // => { count: 512.00, unit: 'B' }
 * calculateSize(1500); // => { count: 1.50, unit: 'KB' }
 * calculateSize(1048576); // => { count: 1.05, unit: 'MB' }
 * calculateSize(5368709120); // => { count: 5.37, unit: 'GB' }
 * calculateSize(1048576, { unit: 'KB' }); // => { count: 1024.00, unit: 'KB' }
 * calculateSize(3018576, { unit: 'MB', decimal: 1, increment: 1024 }); // => { count: 2.9, unit: 'MB' }
 * ```
 */
export function calculateSize(bytes: number, options: ISizeOption = {}): { count: number; unit: ISizeUnit } {
  if (!isPositiveFiniteNumber(bytes)) {
    return { count: 0, unit: 'B' };
  }

  const { unit = 'auto', increment = 1000, decimal = 2 } = options;

  let targetIndex = 0;

  if (unit === 'auto' || !UNITS.includes(unit)) {
    // Auto-scale: find the appropriate unit
    while (bytes >= increment && targetIndex < UNITS.length - 1) {
      bytes /= increment;
      targetIndex++;
    }
  } else {
    // Fixed unit: convert to specified unit
    targetIndex = UNITS.indexOf(unit as ISizeUnit);
    if (targetIndex === -1) {
      targetIndex = 0; // Fallback to bytes for invalid unit
    }

    // Scale down to target unit
    for (let i = 0; i < targetIndex; i++) {
      bytes /= increment;
    }
  }

  const round = 10 * decimal;
  const count = Math.round(bytes * round) / round;

  return { count, unit: UNITS[targetIndex] };
}
