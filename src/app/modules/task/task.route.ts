import express from 'express';
import access from '../../middlewares/access.middleware';
import auth from '../../middlewares/auth.middleware';
import * as TaskControllers from './task.controller';

const router = express.Router();

router.get('/', auth(), access('view_tasks'), TaskControllers.getAllTasks);

router.get('/:id', auth(), access('view_tasks'), TaskControllers.getTaskById);

router.post('/', auth(), access('manage_tasks'), TaskControllers.createTask);

router.patch(
  '/:id',
  auth(),
  access('manage_tasks'),
  TaskControllers.updateTask,
);

router.delete(
  '/:id',
  auth(),
  access('manage_tasks'),
  TaskControllers.deleteTask,
);

export const TaskRoutes = router;
