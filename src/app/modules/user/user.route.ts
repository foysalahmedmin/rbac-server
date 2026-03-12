import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as UserControllers from './user.controller';
import * as UserValidations from './user.validation';

const router = express.Router();

router.get(
  '/me',
  auth('admin', 'manager', 'agent', 'customer'),
  UserControllers.getMe,
);

router.patch(
  '/me',
  auth('admin', 'manager', 'agent', 'customer'),
  validation(UserValidations.updateUserSchema),
  UserControllers.updateMe,
);

router.get(
  '/',
  auth('admin', 'manager', 'agent', 'customer'),
  UserControllers.getUsers,
);

router.get(
  '/:id',
  auth('admin', 'manager', 'agent', 'customer'),
  UserControllers.getUser,
);

router.patch(
  '/:id',
  auth('admin'),
  validation(UserValidations.updateUserSchema),
  UserControllers.updateUser,
);

router.delete('/:id', auth('admin'), UserControllers.deleteUser);
router.delete(
  '/:id/permanent',
  auth('admin'),
  UserControllers.permanentDeleteUser,
);
router.patch('/:id/restore', auth('admin'), UserControllers.restoreUser);

export default router;
