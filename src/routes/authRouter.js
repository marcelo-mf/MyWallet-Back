import signUp from '../controllers/signUpController.js';
import signIn from '../controllers/signInController.js';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/cadastro', signUp);
authRouter.post('/', signIn);

export default authRouter;