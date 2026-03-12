import express from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as UserControllers from './user.controller';
import * as UserValidations from './user.validation';

const router = express.Router();

router.get(
  '/me',
  auth(), // Anyone logged in can see 'me'
  UserControllers.getMe,
);

router.patch(
  '/me',
  auth(), // Anyone logged in can update 'me'
  validation(UserValidations.updateUserSchema),
  UserControllers.updateMe,
);

router.get('/', auth(), access('manage_users'), UserControllers.getUsers);

router.get('/:id', auth(), access('manage_users'), UserControllers.getUser);

router.patch(
  '/:id',
  auth(),
  access('manage_users'),
  validation(UserValidations.updateUserSchema),
  UserControllers.updateUser,
);

router.delete(
  '/:id',
  auth(),
  access('manage_users'),
  UserControllers.deleteUser,
);

router.delete(
  '/:id/permanent',
  auth(),
  access('manage_users'),
  UserControllers.permanentDeleteUser,
);

router.patch(
  '/:id/restore',
  auth(),
  access('manage_users'),
  UserControllers.restoreUser,
);

export default router;
