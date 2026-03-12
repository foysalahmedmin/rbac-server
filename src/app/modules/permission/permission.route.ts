import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import * as PermissionControllers from './permission.controller';

const router = Router();

router.get('/', auth('admin', 'manager'), PermissionControllers.getPermissions);

router.get(
  '/:id',
  auth('admin', 'manager'),
  PermissionControllers.getPermissionById,
);

export const PermissionRoutes = router;
