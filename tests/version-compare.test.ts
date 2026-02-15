import { describe, test, expect } from 'vitest';
import { compareVersions } from '../src/version-compare.js';

describe('compareVersions', () => {
  describe('valid version comparisons', () => {
    test('returns greater when major version is higher', () => {
      const result = compareVersions('2.0.0', '1.0.0');
      expect(result).toEqual({ comparison: 'greater' });
    });

    test('returns greater when minor version is higher', () => {
      const result = compareVersions('1.2.0', '1.1.0');
      expect(result).toEqual({ comparison: 'greater' });
    });

    test('returns greater when patch version is higher', () => {
      const result = compareVersions('1.0.2', '1.0.1');
      expect(result).toEqual({ comparison: 'greater' });
    });

    test('returns less when first version is lower', () => {
      const result = compareVersions('1.0.0', '2.0.0');
      expect(result).toEqual({ comparison: 'less' });
    });

    test('returns equal when versions match', () => {
      const result = compareVersions('1.2.3', '1.2.3');
      expect(result).toEqual({ comparison: 'equal' });
    });
  });

  describe('invalid version formats', () => {
    test('returns invalid for non-semver format', () => {
      const result = compareVersions('invalid', '1.0.0');
      expect(result.comparison).toBe('invalid');
      expect(result).toHaveProperty('reason');
    });

    test('returns invalid for missing components', () => {
      const result = compareVersions('1.0', '1.0.0');
      expect(result.comparison).toBe('invalid');
      expect(result).toHaveProperty('reason');
    });

    test('returns invalid for non-numeric components', () => {
      const result = compareVersions('1.a.0', '1.0.0');
      expect(result.comparison).toBe('invalid');
      expect(result).toHaveProperty('reason');
    });

    test('returns invalid when both inputs are invalid', () => {
      const result = compareVersions('bad', 'worse');
      expect(result.comparison).toBe('invalid');
      expect(result).toHaveProperty('reason');
    });
  });

  describe('edge cases', () => {
    test('handles zero versions', () => {
      const result = compareVersions('0.0.0', '0.0.1');
      expect(result).toEqual({ comparison: 'less' });
    });

    test('handles large version numbers', () => {
      const result = compareVersions('999.999.999', '1000.0.0');
      expect(result).toEqual({ comparison: 'less' });
    });
  });
});
