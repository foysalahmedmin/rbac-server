import { Router } from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import * as AuditLogControllers from './audit-log.controller';

const router = Router();

// Only those with 'view_audit_logs' permission can see all logs
router.get(
  '/',
  auth(),
  access('view_audit_logs'),
  AuditLogControllers.getAuditLogs,
);

router.get('/me', auth(), AuditLogControllers.getMyLogs);

export const AuditLogRoutes = router;
