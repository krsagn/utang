import { Router } from 'express';
import { signUp, logIn, logOut, getMe } from '../controllers/authController.js';

const authRouter = Router();

// Route definitions
authRouter.post('/users', signUp);
authRouter.post('/sessions', logIn);
authRouter.delete('/sessions/current', logOut);
authRouter.get('/users/me', getMe);

export default authRouter;
