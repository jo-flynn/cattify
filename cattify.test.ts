import request from 'supertest';
import express from 'express';
import { router } from './routes';
import { cattifyJson } from './cattify';

describe('cattifyJson core function', () => {
  describe('Simple value replacements', () => {
    it('should replace exact string value "dog" with "cat"', () => {
      const input = { pet: 'dog' };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ pet: 'cat' });
      expect(result.replacementsCount).toBe(1);
      expect(result.limitReached).toBe(false);
    });

    it('should not replace strings containing "dog"', () => {
      const input = { pet: 'doghouse' };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ pet: 'doghouse' });
      expect(result.replacementsCount).toBe(0);
    });

    it('should handle multiple string value replacements', () => {
      const input = { pet1: 'dog', pet2: 'dog', pet3: 'bird' };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ pet1: 'cat', pet2: 'cat', pet3: 'bird' });
      expect(result.replacementsCount).toBe(2);
    });
  });

  describe('Key replacements', () => {
    it('should replace "dog" in keys with "cat"', () => {
      const input = { dog: 'animal' };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ cat: 'animal' });
      expect(result.replacementsCount).toBe(1);
    });

    it('should replace multiple occurrences of "dog" in a key', () => {
      const input = { dogdog: 'test' };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ catcat: 'test' });
      expect(result.replacementsCount).toBe(2);
    });

    it('should replace "dog" substring in keys', () => {
      const input = { doghouse: 'shelter', hotdog: 'food' };
      const result = cattifyJson(input);
      
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
      const result = cattifyJson(input);
      
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
      const result = cattifyJson(input);
      
      expect(result.result).toEqual(['cat', 'cat', 'bird']);
      expect(result.replacementsCount).toBe(2);
    });

    it('should handle arrays of objects', () => {
      const input = [
        { pet: 'dog', dogname: 'spot' },
        { pet: 'cat', dogname: 'fluffy' }
      ];
      const result = cattifyJson(input);
      
      expect(result.result).toEqual([
        { pet: 'cat', catname: 'spot' },
        { pet: 'cat', catname: 'fluffy' }
      ]);
      expect(result.replacementsCount).toBe(3); // 1 value + 2 keys
    });

    it('should handle nested arrays', () => {
      const input = [['dog'], ['cat', 'dog']];
      const result = cattifyJson(input);
      
      expect(result.result).toEqual([['cat'], ['cat', 'cat']]);
      expect(result.replacementsCount).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty objects', () => {
      const input = {};
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({});
      expect(result.replacementsCount).toBe(0);
    });

    it('should handle empty arrays', () => {
      const input: any[] = [];
      const result = cattifyJson(input);
      
      expect(result.result).toEqual([]);
      expect(result.replacementsCount).toBe(0);
    });

    it('should handle null values', () => {
      const input = { pet: null, dog: null };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ pet: null, cat: null });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle undefined values', () => {
      const input = { pet: undefined, dog: undefined };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ pet: undefined, cat: undefined });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle primitive values', () => {
      const input = 'dog';
      const result = cattifyJson(input);
      
      expect(result.result).toBe('cat');
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle numbers', () => {
      const input = { count: 5, dog: 10 };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ count: 5, cat: 10 });
      expect(result.replacementsCount).toBe(1);
    });

    it('should handle booleans', () => {
      const input = { isDog: true, dog: false };
      const result = cattifyJson(input);
      
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

    it('should handle unlimited replacements when limit is not specified', () => {
      const input = { 
        dog1: 'dog', 
        dog2: 'dog', 
        dog3: 'dog',
        dog4: 'dog',
        dog5: 'dog'
      };
      const result = cattifyJson(input);
      
      expect(result.replacementsCount).toBe(10); // 5 keys + 5 values
      expect(result.limitReached).toBe(false);
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
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ Dog: 'value', DOG: 'value', cat: 'value' });
      expect(result.replacementsCount).toBe(1);
    });

    it('should not replace "dog" in value if case differs', () => {
      const input = { pet: 'Dog', another: 'DOG', third: 'dog' };
      const result = cattifyJson(input);
      
      expect(result.result).toEqual({ pet: 'Dog', another: 'DOG', third: 'cat' });
      expect(result.replacementsCount).toBe(1);
    });
  });
});

describe('POST /cattify endpoint', () => {
  const app = express();
  app.use(express.json());
  app.use(router);

  describe('Successful transformations', () => {
    it('should transform JSON payload with dog values', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog', animal: 'dog' })
        .expect(200);
      
      expect(response.body).toEqual({ pet: 'cat', animal: 'cat' });
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should transform JSON payload with dog keys', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({ dog: 'animal', hotdog: 'food' })
        .expect(200);
      
      expect(response.body).toEqual({ cat: 'animal', hotcat: 'food' });
    });

    it('should handle nested structures', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({ 
          outer: { 
            inner: { 
              pet: 'dog',
              doghouse: 'shelter'
            } 
          } 
        })
        .expect(200);
      
      expect(response.body).toEqual({ 
        outer: { 
          inner: { 
            pet: 'cat',
            cathouse: 'shelter'
          } 
        } 
      });
    });

    it('should handle arrays', async () => {
      const response = await request(app)
        .post('/cattify')
        .send(['dog', 'dog', 'bird'])
        .expect(200);
      
      expect(response.body).toEqual(['cat', 'cat', 'bird']);
    });
  });

  describe('Environment variable limits', () => {
    const originalEnv = process.env.MAX_CATTIFY_REPLACEMENTS;

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.MAX_CATTIFY_REPLACEMENTS;
      } else {
        process.env.MAX_CATTIFY_REPLACEMENTS = originalEnv;
      }
    });

    it('should respect MAX_CATTIFY_REPLACEMENTS environment variable', async () => {
      process.env.MAX_CATTIFY_REPLACEMENTS = '2';
      
      const response = await request(app)
        .post('/cattify')
        .send({ pet1: 'dog', pet2: 'dog', pet3: 'dog' })
        .expect(200);
      
      // Should only replace first 2
      expect(response.body.pet1).toBe('cat');
      expect(response.body.pet2).toBe('cat');
      expect(response.body.pet3).toBe('dog');
    });

    it('should handle unlimited replacements when env var is not set', async () => {
      delete process.env.MAX_CATTIFY_REPLACEMENTS;
      
      const response = await request(app)
        .post('/cattify')
        .send({ 
          dog1: 'dog',
          dog2: 'dog',
          dog3: 'dog'
        })
        .expect(200);
      
      // All should be replaced
      expect(response.body).toHaveProperty('cat1');
      expect(response.body).toHaveProperty('cat2');
      expect(response.body).toHaveProperty('cat3');
      expect(response.body.cat1).toBe('cat');
      expect(response.body.cat2).toBe('cat');
      expect(response.body.cat3).toBe('cat');
    });

    it('should return 400 for invalid MAX_CATTIFY_REPLACEMENTS', async () => {
      process.env.MAX_CATTIFY_REPLACEMENTS = 'invalid';
      
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog' })
        .expect(400);
      
      expect(response.body.error).toBe('MAX_CATTIFY_REPLACEMENTS must be a non-negative integer');
    });

    it('should return 400 for negative MAX_CATTIFY_REPLACEMENTS', async () => {
      process.env.MAX_CATTIFY_REPLACEMENTS = '-1';
      
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog' })
        .expect(400);
      
      expect(response.body.error).toBe('MAX_CATTIFY_REPLACEMENTS must be a non-negative integer');
    });
  });

  describe('Error handling', () => {
    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({})
        .expect(200);
      
      expect(response.body).toEqual({});
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog' })
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
