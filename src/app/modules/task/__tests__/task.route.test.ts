import request from 'supertest';
import app from '../../../../app';
import * as TaskService from '../task.service';

// Mock TaskService
jest.mock('../task.service');

// Mock auth middleware to bypass it
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = {
      id: 1,
      role: 'admin',
      permissions: ['view_tasks', 'manage_tasks'],
    };
    next();
  });
});

// Mock access middleware to bypass it
jest.mock('../../../middlewares/access.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => {
    next();
  });
});

describe('Task Routes', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    assignee_id: 1,
  };

  const mockPaginatedResult = {
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_page: 1,
    },
    data: [mockTask],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/tasks/', () => {
    it('should return all tasks with pagination', async () => {
      (TaskService.findAll as jest.Mock).mockResolvedValue(mockPaginatedResult);

      const response = await request(app).get('/api/v1/tasks/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPaginatedResult.data);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should return a task by id', async () => {
      (TaskService.findById as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app).get('/api/v1/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockTask);
    });
  });

  describe('POST /api/v1/tasks/', () => {
    it('should create a new task', async () => {
      const taskData = { title: 'New Task', status: 'pending' };
      (TaskService.create as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...taskData,
      });

      const response = await request(app).post('/api/v1/tasks/').send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Task');
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('should update a task', async () => {
      const updateData = { title: 'Updated' };
      (TaskService.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...updateData,
      });

      const response = await request(app)
        .patch('/api/v1/tasks/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task', async () => {
      (TaskService.remove as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app).delete('/api/v1/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
