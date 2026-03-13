import { Router } from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import * as PermissionControllers from './permission.controller';

const router = Router();

router.get(
  '/',
  auth(),
  access('manage_roles'),
  PermissionControllers.getPermissions,
);

router.get(
  '/grouped',
  auth(),
  access('manage_roles'),
  PermissionControllers.getGroupedPermissions,
);

router.get(
  '/:id',
  auth(),
  access('manage_roles'),
  PermissionControllers.getPermissionById,
);

export const PermissionRoutes = router;
