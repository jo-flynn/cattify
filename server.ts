import 'dotenv/config';
import express from 'express';
import { router } from './app/routes';

export const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use(router);

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
