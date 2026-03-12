import express from 'express';
import { AuditLogRoutes } from '../modules/audit-log/audit-log.route';
import authRouter from '../modules/auth/auth.route';
import { PermissionRoutes } from '../modules/permission/permission.route';
import { RoleRoutes } from '../modules/role/role.route';
import userRouter from '../modules/user/user.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/users',
    route: userRouter,
  },
  {
    path: '/roles',
    route: RoleRoutes,
  },
  {
    path: '/permissions',
    route: PermissionRoutes,
  },
  {
    path: '/audit-logs',
    route: AuditLogRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
