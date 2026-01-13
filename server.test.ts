import request from 'supertest';
import { app } from './server';

describe('Health Endpoint', () => {
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
