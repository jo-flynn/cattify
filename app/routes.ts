import { Router, Request, Response } from 'express';
import { Worker } from 'worker_threads';
import path from 'path';
import fs from 'fs';

export const router = Router();

// Resolve worker path 
const workerPath1 = path.join(__dirname, 'cattify.worker.js');
const workerPath2 = path.join(__dirname, '..', 'dist', 'app', 'cattify.worker.js');
const workerPath = fs.existsSync(workerPath1) ? workerPath1 : workerPath2;

// Validate max replacements to avoid doing it per request
// There is probably a cleaner way to do this.
const maxReplacementsEnv = process.env.MAX_CATTIFY_REPLACEMENTS;

if (maxReplacementsEnv === undefined) {
  throw new Error('MAX_CATTIFY_REPLACEMENTS is not set');
}

const maxReplacements = parseInt(maxReplacementsEnv, 10);

if (isNaN(maxReplacements) || maxReplacements < 0) {
  throw new Error('MAX_CATTIFY_REPLACEMENTS must be a non-negative integer');
}

// Cattify endpoint - replaces "dog" with "cat" in JSON payloads
router.post('/cattify', async (req: Request, res: Response) => {
  try {
    const jsonBody = req.body;
    
    // Process the JSON using a worker
    const worker = new Worker(workerPath);
    const requestId = `${Date.now()}-${Math.random()}`;
    
    // Set up message handler
    const resultPromise = new Promise((resolve, reject) => {
      worker.on('message', (response: { result: any; requestId: string; error?: string }) => {
        if (response.requestId === requestId) {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        }
      });
      
      worker.on('error', (error) => {
        reject(error);
      });
      
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
    
    // Send message to worker
    worker.postMessage({
      data: jsonBody,
      limit: maxReplacements,
      requestId,
    });
    
    // Wait for result
    const result = await resultPromise;
    
    // Terminate worker
    await worker.terminate();
    
    // Return the transformed JSON
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' });
  }
});