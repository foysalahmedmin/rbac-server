import request from 'supertest';
import app from '../../../../app';
import * as AuditLogService from '../audit-log.service';

// Mock AuditLogService
jest.mock('../audit-log.service');

// Mock auth middleware to bypass it
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { id: 1, role: 'admin', permissions: ['view_audit_logs'] };
    next();
  });
});

// Mock access middleware to bypass it
jest.mock('../../../middlewares/access.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => {
    next();
  });
});

describe('Audit Log Routes', () => {
  const mockAuditLog = {
    id: 1,
    user_id: 1,
    action: 'UPDATE',
    resource: 'User',
    resource_id: '1',
  };

  const mockPaginatedResult = {
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_page: 1,
    },
    data: [mockAuditLog],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/audit-logs/', () => {
    it('should return all audit logs with pagination', async () => {
      (AuditLogService.getAllLogs as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );

      const response = await request(app).get('/api/v1/audit-logs/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.meta).toEqual(mockPaginatedResult.meta);
      expect(response.body.data).toEqual(mockPaginatedResult.data);
    });
  });

  describe('GET /api/v1/audit-logs/me', () => {
    it('should return current user audit logs', async () => {
      (AuditLogService.getLogsByUser as jest.Mock).mockResolvedValue([
        mockAuditLog,
      ]);

      const response = await request(app).get('/api/v1/audit-logs/me');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([mockAuditLog]);
    });
  });
});
