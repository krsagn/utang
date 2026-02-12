import { Router } from 'express';
import { signUp, logIn, logOut, getMe } from '../controllers/authController.js';

const authRouter = Router();

// Route definitions
authRouter.post('/signup', signUp);
authRouter.post('/login', logIn);
authRouter.delete('/logout', logOut);
authRouter.get('/get-me', getMe);

export default authRouter;
