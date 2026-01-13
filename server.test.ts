import request from 'supertest';
import express from 'express';
import { router } from './routes';

describe('Health Endpoint', () => {
  const app = express();
  app.use(express.json());
  app.use(router);

  it('should return status ok', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get('/health');
    
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
