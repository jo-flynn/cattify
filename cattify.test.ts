import { cattifyJson } from './cattify';

describe('cattifyJson core function', () => {
  const limit = 10;
  describe('Simple value replacements', () => {
    it('should replace exact string value "dog" with "cat"', () => {
      const input = { pet: 'dog' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ pet: 'cat' });
      expect(result.replacementsCount).toBe(1);
      expect(result.limitReached).toBe(false);
    });

    it('should replace "dog" substring in string values', () => {
      const input = { pet: 'doghouse' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ pet: 'cathouse' });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle multiple string value replacements', () => {
      const input = { pet1: 'dog', pet2: 'dog', pet3: 'bird' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ pet1: 'cat', pet2: 'cat', pet3: 'bird' });
      expect(result.replacementsCount).toBe(2);
    });
  });

  describe('Key replacements', () => {
    it('should replace "dog" in keys with "cat"', () => {
      const input = { dog: 'animal' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ cat: 'animal' });
      expect(result.replacementsCount).toBe(1);
    });

    it('should replace multiple occurrences of "dog" in a key', () => {
      const input = { dogdog: 'test' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ catcat: 'test' });
      expect(result.replacementsCount).toBe(2);
    });

    it('should replace "dog" substring in keys', () => {
      const input = { doghouse: 'shelter', hotdog: 'food' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ cathouse: 'shelter', hotcat: 'food' });
      expect(result.replacementsCount).toBe(2);
    });
  });

  describe('Nested structures', () => {
    it('should handle nested objects', () => {
      const input = { 
        outer: { 
          inner: { 
            pet: 'dog',
            key_dog: 'value'
          } 
        } 
      };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ 
        outer: { 
          inner: { 
            pet: 'cat',
            key_cat: 'value'
          } 
        } 
      });
      expect(result.replacementsCount).toBe(2);
    });

    it('should handle arrays', () => {
      const input = ['dog', 'dog', 'bird'];
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual(['cat', 'cat', 'bird']);
      expect(result.replacementsCount).toBe(2);
    });

    it('should handle arrays of objects', () => {
      const input = [
        { pet: 'dog', dogname: 'spot' },
        { pet: 'cat', dogname: 'fluffy' }
      ];
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual([
        { pet: 'cat', catname: 'spot' },
        { pet: 'cat', catname: 'fluffy' }
      ]);
      expect(result.replacementsCount).toBe(3); // 1 value + 2 keys
    });

    it('should handle nested arrays', () => {
      const input = [['dog'], ['cat', 'dog']];
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual([['cat'], ['cat', 'cat']]);
      expect(result.replacementsCount).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty objects', () => {
      const input = {};
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({});
      expect(result.replacementsCount).toBe(0);
    });

    it('should handle empty arrays', () => {
      const input: any[] = [];
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual([]);
      expect(result.replacementsCount).toBe(0);
    });

    it('should handle null values', () => {
      const input = { pet: null, dog: null };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ pet: null, cat: null });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle undefined values', () => {
      const input = { pet: undefined, dog: undefined };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ pet: undefined, cat: undefined });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle primitive values', () => {
      const input = 'dog';
      const result = cattifyJson(input, limit);
      
      expect(result.result).toBe('cat');
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle numbers', () => {
      const input = { count: 5, dog: 10 };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ count: 5, cat: 10 });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle booleans', () => {
      const input = { isDog: true, dog: false };
      const result = cattifyJson(input, limit);
      
      // isDog contains "Dog" (capital D), so case-sensitive match doesn't apply
      expect(result.result).toEqual({ isDog: true, cat: false });
      expect(result.replacementsCount).toBe(1); // Only the key "dog" -> "cat"
    });
  });

  describe('Replacement limits', () => {
    it('should respect replacement limit', () => {
      const input = { pet1: 'dog', pet2: 'dog', pet3: 'dog' };
      const result = cattifyJson(input, 2);
      
      expect(result.result).toEqual({ pet1: 'cat', pet2: 'cat', pet3: 'dog' });
      expect(result.replacementsCount).toBe(2);
      expect(result.limitReached).toBe(true);
    });

    it('should handle limit of 0', () => {
      const input = { pet: 'dog', dog: 'animal' };
      const result = cattifyJson(input, 0);
      
      expect(result.result).toEqual({ pet: 'dog', dog: 'animal' });
      expect(result.replacementsCount).toBe(0);
      expect(result.limitReached).toBe(true);
    });

    it('should stop key replacements when limit is reached', () => {
      const input = { dog1: 'value', dog2: 'value', dog3: 'value' };
      const result = cattifyJson(input, 2);
      
      // First two keys should be replaced
      expect(result.result).toHaveProperty('cat1');
      expect(result.result).toHaveProperty('cat2');
      expect(result.result).toHaveProperty('dog3');
      expect(result.replacementsCount).toBe(2);
      expect(result.limitReached).toBe(true);
    });

    it('should count multiple occurrences in a single key toward limit', () => {
      const input = { dogdog: 'test', pet: 'dog' };
      const result = cattifyJson(input, 2);
      
      // Limit is 2, so key "dogdog" gets replaced (2 replacements), but value "dog" doesn't
      expect(result.result).toEqual({ catcat: 'test', pet: 'dog' });
      expect(result.replacementsCount).toBe(2); // 2 in key, limit reached before value
      expect(result.limitReached).toBe(true);
    });
  });

  describe('Case sensitivity', () => {
    it('should only replace lowercase "dog" (case-sensitive)', () => {
      const input = { Dog: 'value', DOG: 'value', dog: 'value' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ Dog: 'value', DOG: 'value', cat: 'value' });
      expect(result.replacementsCount).toBe(1);
    });

    it('should not replace "dog" in value if case differs', () => {
      const input = { pet: 'Dog', another: 'DOG', third: 'dog' };
      const result = cattifyJson(input, limit);
      
      expect(result.result).toEqual({ pet: 'Dog', another: 'DOG', third: 'cat' });
      expect(result.replacementsCount).toBe(1);
    });
  });
});
