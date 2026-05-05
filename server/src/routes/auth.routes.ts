import express from 'express';
import { user_login, user_logout, user_register } from '../controller/auth.controller';
import { validateRequest } from '../validation/validate';
import { loginSchema, registerSchema } from '../validation/auth.schema';
const authRoute  = express.Router();

authRoute.post('/register', validateRequest(registerSchema), user_register);
authRoute.post('/login',validateRequest(loginSchema), user_login);
authRoute.post('/logout', user_logout);

export default authRoute;