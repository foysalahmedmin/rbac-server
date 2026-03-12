import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as AuthControllers from './auth.controller';
import * as AuthValidations from './auth.validation';

const router = express.Router();

router.post(
  '/signup',
  validation(AuthValidations.signupSchema),
  AuthControllers.signUp,
);

router.post(
  '/signin',
  validation(AuthValidations.signinSchema),
  AuthControllers.signIn,
);

router.post(
  '/refresh-token',
  validation(AuthValidations.refreshTokenSchema),
  AuthControllers.refreshToken,
);

router.patch(
  '/change-password',
  auth('admin', 'manager', 'agent', 'customer'),
  validation(AuthValidations.changePasswordSchema),
  AuthControllers.changePassword,
);

router.post(
  '/forget-password',
  validation(AuthValidations.forgetPasswordSchema),
  AuthControllers.forgetPassword,
);

router.patch(
  '/reset-password',
  validation(AuthValidations.resetPasswordSchema),
  AuthControllers.resetPassword,
);

export default router;
