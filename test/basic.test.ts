import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    expect('hello world').toContain('world');
  });
});
