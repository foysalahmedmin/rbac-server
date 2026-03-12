import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as RoleControllers from './role.controller';
import {
  assignPermissionsSchema,
  createRoleSchema,
  updateRoleSchema,
} from './role.validation';

const router = Router();

router.post(
  '/',
  auth('admin'),
  validation(createRoleSchema),
  RoleControllers.createRole,
);

router.get('/', auth('admin', 'manager'), RoleControllers.getRoles);

router.get('/:id', auth('admin', 'manager'), RoleControllers.getRoleById);

router.patch(
  '/:id',
  auth('admin'),
  validation(updateRoleSchema),
  RoleControllers.updateRole,
);

router.delete('/:id', auth('admin'), RoleControllers.deleteRole);

router.post(
  '/assign-permissions',
  auth('admin'),
  validation(assignPermissionsSchema),
  RoleControllers.assignPermissions,
);

export const RoleRoutes = router;
