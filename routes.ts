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
    const maxReplacements = maxReplacementsEnv 
      ? parseInt(maxReplacementsEnv, 10) 
      : undefined;
    
    // Validate maxReplacements if provided
    if (maxReplacementsEnv !== undefined && (isNaN(maxReplacements!) || maxReplacements! < 0)) {
      return res.status(400).json({ 
        error: 'MAX_CATTIFY_REPLACEMENTS must be a non-negative integer' 
      });
    }
    
    // Process the JSON
    const { result, replacementsCount, limitReached } = cattifyJson(jsonBody, maxReplacements);
    
    // Return the transformed JSON
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' });
  }
});