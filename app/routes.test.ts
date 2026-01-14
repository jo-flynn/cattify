import request from 'supertest';
import express from 'express';
import { router } from './routes';

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
