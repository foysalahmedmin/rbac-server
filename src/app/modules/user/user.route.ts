import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as UserControllers from './user.controller';
import * as UserValidations from './user.validation';

const router = express.Router();

// /self routes MUST come before /:id to avoid being matched as a param
router.get(
  '/self',
  auth('admin', 'manager', 'agent', 'customer'),
  UserControllers.getSelf,
);

router.patch(
  '/self',
  auth('admin', 'manager', 'agent', 'customer'),
  validation(UserValidations.userSchema.partial()),
  UserControllers.updateSelf,
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
  validation(UserValidations.userSchema.partial()),
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
