import { Router, Request, Response } from 'express';
import { cattifyJson } from './cattify';

export const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Cattify endpoint - replaces "dog" with "cat" in JSON payloads
router.post('/cattify', (req: Request, res: Response) => {
  try {
    const jsonBody = req.body;
    
    // Get max replacements from environment variable (optional)
    const maxReplacementsEnv = process.env.MAX_CATTIFY_REPLACEMENTS;

    if (maxReplacementsEnv === undefined) {
      console.log('MAX_CATTIFY_REPLACEMENTS is not set');
      return res.status(500).json({ error: 'Internal server error' });
    }

    const maxReplacements = parseInt(maxReplacementsEnv, 10) 
    
    // Validate maxReplacements if provided
    if ((isNaN(maxReplacements!) || maxReplacements! < 0)) {
      console.log('MAX_CATTIFY_REPLACEMENTS must be a non-negative integer');
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Process the JSON
    const { result, replacementsCount, limitReached } = cattifyJson(jsonBody, maxReplacements);
    
    // Return the transformed JSON
    res.json({ result, replacementsCount, limitReached });
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' });
  }
});