import * as TaskRepository from '../task.repository';
import * as TaskService from '../task.service';

// Mock TaskRepository
jest.mock('../task.repository');

describe('TaskService', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    due_date: new Date(),
    assignee_id: 1,
    assignee: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    },
    created_at: new Date(),
    updated_at: new Date(),
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

  describe('findAll', () => {
    it('should return all tasks with pagination', async () => {
      (TaskRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await TaskService.findAll({});
      expect(result).toEqual(mockPaginatedResult);
      expect(TaskRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('should return a single task by id', async () => {
      (TaskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      const result = await TaskService.findById(1);
      expect(result).toEqual(mockTask);
      expect(TaskRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'medium',
      } as any;
      (TaskRepository.create as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...taskData,
      });
      const result = await TaskService.create(taskData);
      expect(result.title).toBe('New Task');
      expect(TaskRepository.create).toHaveBeenCalledWith(taskData);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const updateData = { title: 'Updated Task' } as any;
      (TaskRepository.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...updateData,
      });
      const result = await TaskService.update(1, updateData);
      expect(result.title).toBe('Updated Task');
      expect(TaskRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      (TaskRepository.remove as jest.Mock).mockResolvedValue(mockTask);
      const result = await TaskService.remove(1);
      expect(result).toEqual(mockTask);
      expect(TaskRepository.remove).toHaveBeenCalledWith(1);
    });
  });
});
