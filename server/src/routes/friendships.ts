import { Router } from 'express';
// Controller function imports
import {
  addFriend,
  acceptFriend,
  deleteFriend,
  getFriends,
  getFriendStats,
  nudgeFriend,
} from '../controllers/friendshipController.js';
import { requireAuth } from '../middleware/auth.js';

const friendshipRouter = Router();

// Guard entire router
friendshipRouter.use(requireAuth);

// Route definitions
friendshipRouter.get('/', getFriends);
friendshipRouter.get('/:id/stats', getFriendStats);
friendshipRouter.post('/', addFriend);
friendshipRouter.post('/:id/nudge', nudgeFriend);
friendshipRouter.patch('/:id', acceptFriend);
friendshipRouter.delete('/:id', deleteFriend);

export default friendshipRouter;
