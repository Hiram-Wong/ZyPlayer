import { describe, expect, it } from 'vitest';

import { isMultidimensionalArray } from '../validate';

describe('validate', () => {
  describe('one-dimensional array', () => {
    it('should handle valid 1D array', () => {
      expect(isMultidimensionalArray([1, 2, 3], 1)).toBe(true);
    });

    it('should handle valid empty 1D array', () => {
      expect(isMultidimensionalArray([], 1)).toBe(true);
    });
  });

  describe('isMultidimensionalArray', () => {
    describe('two-dimensional array', () => {
      it('should handle valid 2D array', () => {
        expect(isMultidimensionalArray([[1, 2]], 2)).toBe(true);
      });

      it('should handle valid 2D array with empty sub-arrays', () => {
        expect(isMultidimensionalArray([[], []], 2)).toBe(true);
      });

      it('should handle valid 1D array', () => {
        expect(isMultidimensionalArray([1, 2, 3], 2)).toBe(false);
      });

      it('should handle valid empty array', () => {
        expect(isMultidimensionalArray([], 2)).toBe(false);
      });

      it('should handle valid mixed array', () => {
        expect(isMultidimensionalArray([[1, 2], 3], 2)).toBe(false);
      });
    });

    describe('three-dimensional array', () => {
      it('should handle valid 3D array', () => {
        expect(isMultidimensionalArray([[[1], [2], [3]]], 3)).toBe(true);
      });

      it('should handle valid 3D array with nested empty arrays', () => {
        expect(isMultidimensionalArray([[[], []]], 3)).toBe(true);
      });

      it('should handle valid 2D array', () => {
        expect(isMultidimensionalArray([[1, 2]], 3)).toBe(false);
      });

      it('should handle valid empty array', () => {
        expect(isMultidimensionalArray([], 3)).toBe(false);
      });

      it('should handle valid mixed depth array', () => {
        expect(isMultidimensionalArray([[[1]], [2]], 3)).toBe(false);
      });
    });
  });
});
