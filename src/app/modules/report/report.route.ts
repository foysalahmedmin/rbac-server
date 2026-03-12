import express from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import * as ReportControllers from './report.controller';

const router = express.Router();

router.get(
  '/',
  auth(),
  access('view_reports'),
  ReportControllers.getAllReports,
);

router.get(
  '/:id',
  auth(),
  access('view_reports'),
  ReportControllers.getReportById,
);

router.post(
  '/',
  auth(),
  access('manage_reports'),
  ReportControllers.createReport,
);

router.patch(
  '/:id',
  auth(),
  access('manage_reports'),
  ReportControllers.updateReport,
);

router.delete(
  '/:id',
  auth(),
  access('manage_reports'),
  ReportControllers.deleteReport,
);

export const ReportRoutes = router;
