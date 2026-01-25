import { describe, expect, it } from 'vitest';

import { objPathValue } from '../obj';

describe('obj', () => {
  describe('objPathValue', () => {
    const data = {
      user: { list: [{ name: 'Tom' }, { name: 'Jerry' }] },
      meta: { count: 2 },
      empty: null,
    };

    it('should handle valid dot notation paths', () => {
      expect(objPathValue(data, 'meta.count')).toBe(2);
    });

    it('should handle array indices', () => {
      expect(objPathValue(data, 'user.list.0.name')).toBe('Tom');
      expect(objPathValue(data, 'user.list[1].name')).toBe('Jerry');
    });

    it('should handle non-existent paths', () => {
      expect(objPathValue(data, 'user.list.10.name')).toBeUndefined();
      expect(objPathValue(data, 'a.b.c')).toBeUndefined();
    });

    it('should handle edge cases', () => {
      expect(objPathValue(data, '')).toBeUndefined();
      expect(objPathValue(data, null as any)).toBeUndefined();
      expect(objPathValue(data, 123 as any)).toBeUndefined();
    });
  });
});
