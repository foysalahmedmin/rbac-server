import request from 'supertest';
import app from '../../../../app';
import * as ReportService from '../report.service';

// Mock ReportService
jest.mock('../report.service');

// Mock auth middleware
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = {
      id: 1,
      role: 'admin',
      permissions: ['view_reports', 'manage_reports'],
    };
    next();
  });
});

// Mock access middleware
jest.mock('../../../middlewares/access.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => {
    next();
  });
});

describe('Report Routes', () => {
  const mockReport = {
    id: 1,
    name: 'Sales Report',
    type: 'monthly',
  };

  const mockPaginatedResult = {
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_page: 1,
    },
    data: [mockReport],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/reports/', () => {
    it('should return all reports with pagination', async () => {
      (ReportService.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const response = await request(app).get('/api/v1/reports/');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockPaginatedResult.data);
    });
  });

  describe('GET /api/v1/reports/:id', () => {
    it('should return a report by id', async () => {
      (ReportService.findById as jest.Mock).mockResolvedValue(mockReport);
      const response = await request(app).get('/api/v1/reports/1');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockReport);
    });
  });

  describe('POST /api/v1/reports/', () => {
    it('should create a new report', async () => {
      const reportData = { name: 'New Report', type: 'weekly' };
      (ReportService.create as jest.Mock).mockResolvedValue({
        ...mockReport,
        ...reportData,
      });
      const response = await request(app)
        .post('/api/v1/reports/')
        .send(reportData);
      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('New Report');
    });
  });

  describe('PATCH /api/v1/reports/:id', () => {
    it('should update a report', async () => {
      const updateData = { name: 'Updated' };
      (ReportService.update as jest.Mock).mockResolvedValue({
        ...mockReport,
        ...updateData,
      });
      const response = await request(app)
        .patch('/api/v1/reports/1')
        .send(updateData);
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/reports/:id', () => {
    it('should delete a report', async () => {
      (ReportService.remove as jest.Mock).mockResolvedValue(mockReport);
      const response = await request(app).delete('/api/v1/reports/1');
      expect(response.status).toBe(200);
    });
  });
});
