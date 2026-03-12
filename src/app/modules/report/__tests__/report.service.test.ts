import * as ReportRepository from '../report.repository';
import * as ReportService from '../report.service';

// Mock ReportRepository
jest.mock('../report.repository');

describe('ReportService', () => {
  const mockReport = {
    id: 1,
    name: 'Sales Report',
    type: 'monthly',
    data: { total: 1000 },
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
    data: [mockReport],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all reports with pagination', async () => {
      (ReportRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await ReportService.findAll({});
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findById', () => {
    it('should return a single report by id', async () => {
      (ReportRepository.findById as jest.Mock).mockResolvedValue(mockReport);
      const result = await ReportService.findById(1);
      expect(result).toEqual(mockReport);
    });
  });

  describe('create', () => {
    it('should create a new report', async () => {
      const reportData = {
        name: 'New Report',
        type: 'weekly',
        data: {},
      } as any;
      (ReportRepository.create as jest.Mock).mockResolvedValue({
        ...mockReport,
        ...reportData,
      });
      const result = await ReportService.create(reportData);
      expect(result.name).toBe('New Report');
    });
  });

  describe('update', () => {
    it('should update an existing report', async () => {
      const updateData = { name: 'Updated Report' } as any;
      (ReportRepository.update as jest.Mock).mockResolvedValue({
        ...mockReport,
        ...updateData,
      });
      const result = await ReportService.update(1, updateData);
      expect(result.name).toBe('Updated Report');
    });
  });

  describe('remove', () => {
    it('should delete a report', async () => {
      (ReportRepository.remove as jest.Mock).mockResolvedValue(mockReport);
      const result = await ReportService.remove(1);
      expect(result).toEqual(mockReport);
    });
  });
});
