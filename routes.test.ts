import request from 'supertest';
import express from 'express';
import { router } from './routes';

describe('POST /cattify endpoint', () => {
  const originalEnv = process.env.MAX_CATTIFY_REPLACEMENTS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.MAX_CATTIFY_REPLACEMENTS;
    } else {
      process.env.MAX_CATTIFY_REPLACEMENTS = originalEnv;
    }
  });
  
  const app = express();
  app.use(express.json());
  app.use(router);

  describe('Successful transformations', () => {
    it('should transform JSON payload with dog values', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog', animal: 'dog' })
        .expect(200);
      
      expect(response.body).toEqual({ result: { pet: 'cat', animal: 'cat' }, replacementsCount: 2, limitReached: false });
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should transform JSON payload with dog keys', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({ dog: 'animal', hotdog: 'food' })
        .expect(200);
      
      expect(response.body).toEqual({ result: { cat: 'animal', hotcat: 'food' }, replacementsCount: 2, limitReached: false });
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
        result: { 
          outer: { 
          inner: { 
              pet: 'cat',
              cathouse: 'shelter'
            } 
          } 
        },
        replacementsCount: 2,
        limitReached: false
      });
    });

    it('should handle arrays', async () => {
      const response = await request(app)
        .post('/cattify')
        .send(['dog', 'dog', 'bird'])
        .expect(200);
      
      expect(response.body).toEqual({ result: ['cat', 'cat', 'bird'], replacementsCount: 2, limitReached: false });
    });
  });

  describe('Environment variable limits', () => {
    let originalConsoleLog: typeof console.log;

    beforeAll(() => {
      originalConsoleLog = console.log;
      console.log = jest.fn();
    });

    afterAll(() => {
      console.log = originalConsoleLog;
    });

    afterEach(() => {
      (console.log as jest.Mock).mockClear();
    });

    it('should respect MAX_CATTIFY_REPLACEMENTS environment variable', async () => {
      process.env.MAX_CATTIFY_REPLACEMENTS = '2';
      
      const response = await request(app)
        .post('/cattify')
        .send({ pet1: 'dog', pet2: 'dog', pet3: 'dog' })
        .expect(200);
      
      // Should only replace first 2
      expect(response.body.result.pet1).toBe('cat');
      expect(response.body.result.pet2).toBe('cat');
      expect(response.body.result.pet3).toBe('dog');
      expect(response.body.replacementsCount).toBe(2);
      expect(response.body.limitReached).toBe(true);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return 500 for invalid MAX_CATTIFY_REPLACEMENTS', async () => {
      delete process.env.MAX_CATTIFY_REPLACEMENTS
      
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog' })
        .expect(500);
      
      expect(console.log).toHaveBeenCalledWith('MAX_CATTIFY_REPLACEMENTS is not set');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should return 500 for negative MAX_CATTIFY_REPLACEMENTS', async () => {
      process.env.MAX_CATTIFY_REPLACEMENTS = '-1';
      
      const response = await request(app)
        .post('/cattify')
        .send({ pet: 'dog' })
        .expect(500);
      
      expect(console.log).toHaveBeenCalledWith('MAX_CATTIFY_REPLACEMENTS must be a non-negative integer');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('Error handling', () => {
    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/cattify')
        .send({})
        .expect(200);
      
      expect(response.body).toEqual({ limitReached: false, replacementsCount: 0, result: {} });
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
