import { Router } from 'express';
// Controller function imports
import { searchUsers } from '../controllers/userController.js';

import { requireAuth } from '../middleware/auth.js';

const usersRouter = Router();

// Guard entire router
usersRouter.use(requireAuth);

// Route definitions
usersRouter.get('/search', searchUsers);

export default usersRouter;
