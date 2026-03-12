import express from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import * as LeadControllers from './lead.controller';

const router = express.Router();

router.get('/', auth(), access('view_leads'), LeadControllers.getAllLeads);

router.get('/:id', auth(), access('view_leads'), LeadControllers.getLeadById);

router.post('/', auth(), access('manage_leads'), LeadControllers.createLead);

router.patch(
  '/:id',
  auth(),
  access('manage_leads'),
  LeadControllers.updateLead,
);

router.delete(
  '/:id',
  auth(),
  access('manage_leads'),
  LeadControllers.deleteLead,
);

export const LeadRoutes = router;
