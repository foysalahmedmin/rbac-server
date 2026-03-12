import { Router } from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as RoleControllers from './role.controller';
import {
  assignPermissionsSchema,
  createRoleSchema,
  updateRoleSchema,
} from './role.validation';

const router = Router();

// Only those with 'manage_roles' permission can create, update, delete roles
router.post(
  '/',
  auth(), // Check for valid token
  access('manage_roles'), // Check for specific permission
  validation(createRoleSchema),
  RoleControllers.createRole,
);

router.get('/', auth(), access('manage_roles'), RoleControllers.getRoles);

router.get('/:id', auth(), access('manage_roles'), RoleControllers.getRoleById);

router.patch(
  '/:id',
  auth(),
  access('manage_roles'),
  validation(updateRoleSchema),
  RoleControllers.updateRole,
);

router.delete(
  '/:id',
  auth(),
  access('manage_roles'),
  RoleControllers.deleteRole,
);

router.post(
  '/assign-permissions',
  auth(),
  access('manage_roles'),
  validation(assignPermissionsSchema),
  RoleControllers.assignPermissions,
);

export const RoleRoutes = router;
