import express from 'express';
import debtRouter from './routes/debts.js';
import authRouter from './routes/auth.js';
import friendshipRouter from './routes/friendships.js';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// Only allow requests from the frontend
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // allows website to send cookies
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Enable auth middleware
app.use(authMiddleware);

app.use('/auth', authRouter);
app.use('/friendships', friendshipRouter);
app.use('/debts', debtRouter);

// create a GET / health check route
app.get('/', (_req, res) => {
  res.send('Utang API is alive!');
});

export default app;
