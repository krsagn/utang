import { Router } from 'express';
import { signUp, logIn, logOut, getMe } from '../controllers/authController.js';

const authRouter = Router();

// Route definitions
authRouter.post('/users', signUp);
authRouter.post('/sessions', logIn);
authRouter.delete('/sessions/current', logOut);
authRouter.get('/sessions/current', getMe);

export default authRouter;
