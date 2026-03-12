import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validateRequest from '../../middlewares/validate-request';
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
  validateRequest(createRoleSchema),
  RoleControllers.createRole,
);

router.get('/', auth('admin', 'manager'), RoleControllers.getRoles);

router.get('/:id', auth('admin', 'manager'), RoleControllers.getRoleById);

router.patch(
  '/:id',
  auth('admin'),
  validateRequest(updateRoleSchema),
  RoleControllers.updateRole,
);

router.delete('/:id', auth('admin'), RoleControllers.deleteRole);

router.post(
  '/assign-permissions',
  auth('admin'),
  validateRequest(assignPermissionsSchema),
  RoleControllers.assignPermissions,
);

export const RoleRoutes = router;
