import * as AuditLogRepository from '../audit-log.repository';
import * as AuditLogService from '../audit-log.service';

// Mock AuditLogRepository
jest.mock('../audit-log.repository');

describe('AuditLogService', () => {
  const mockAuditLog = {
    id: 1,
    user_id: 1,
    action: 'CREATE',
    resource: 'User',
    resource_id: '2',
    details: { name: 'New User' },
    ip_address: '127.0.0.1',
    created_at: new Date(),
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

  describe('logAction', () => {
    it('should successfully create an audit log', async () => {
      (AuditLogRepository.create as jest.Mock).mockResolvedValue(mockAuditLog);

      const result = await AuditLogService.logAction({
        user_id: 1,
        action: 'CREATE',
        resource: 'User',
        resource_id: '2',
        details: { name: 'New User' },
        ip_address: '127.0.0.1',
      });

      expect(result).toEqual(mockAuditLog);
      expect(AuditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('getAllLogs', () => {
    it('should return all audit logs with pagination', async () => {
      (AuditLogRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await AuditLogService.getAllLogs({});
      expect(result).toEqual(mockPaginatedResult);
      expect(AuditLogRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getLogsByUser', () => {
    it('should return audit logs for a specific user', async () => {
      (AuditLogRepository.findByUserId as jest.Mock).mockResolvedValue([
        mockAuditLog,
      ]);
      const result = await AuditLogService.getLogsByUser(1);
      expect(result).toEqual([mockAuditLog]);
      expect(AuditLogRepository.findByUserId).toHaveBeenCalledWith(1);
    });
  });
});
