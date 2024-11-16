import express from 'express';
import { register, login } from '../controllers/userController.js';
import { requestPasswordReset, verifyCode, resetPassword } from '../controllers/forgetPassword.js';
import { registerValidation, loginValidation } from '../middelware/validation.js';
import {validatorHandlerMiddleware} from '../middelware/validatorHandlerMiddleware.js'
import { userAuth } from '../middelware/userMiddleware.js';



const router = express.Router();

// Registration Route
router.post('/register', registerValidation,validatorHandlerMiddleware, register);

// Login Route
router.post('/login', loginValidation, validatorHandlerMiddleware, login);


router.post('/forget-password',userAuth, requestPasswordReset);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

export default router;