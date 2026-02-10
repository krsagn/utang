import express from 'express';
import router from './routes/debts.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use('/debts', router);

// create a GET / health check route
app.get('/', (_req, res) => {
  res.send('Utang API is alive!');
});

export default app;
