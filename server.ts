import express, { Request, Response } from 'express';

export const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware to parse JSON bodies
app.use(express.json());

// Basic health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
