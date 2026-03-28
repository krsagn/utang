import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './socket.js';

const httpServer = createServer(app);
initSocket(httpServer);
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
