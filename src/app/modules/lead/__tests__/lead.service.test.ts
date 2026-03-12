import * as LeadRepository from '../lead.repository';
import * as LeadService from '../lead.service';

// Mock LeadRepository
jest.mock('../lead.repository');

describe('LeadService', () => {
  const mockLead = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '123456789',
    source: 'Website',
    status: 'new',
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
    data: [mockLead],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all leads with pagination', async () => {
      (LeadRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await LeadService.findAll({});
      expect(result).toEqual(mockPaginatedResult);
      expect(LeadRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('should return a single lead by id', async () => {
      (LeadRepository.findById as jest.Mock).mockResolvedValue(mockLead);
      const result = await LeadService.findById(1);
      expect(result).toEqual(mockLead);
      expect(LeadRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const leadData = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
      } as any;
      (LeadRepository.create as jest.Mock).mockResolvedValue({
        ...mockLead,
        ...leadData,
      });
      const result = await LeadService.create(leadData);
      expect(result.first_name).toBe('Jane');
      expect(LeadRepository.create).toHaveBeenCalledWith(leadData);
    });
  });

  describe('update', () => {
    it('should update an existing lead', async () => {
      const updateData = { first_name: 'Updated' } as any;
      (LeadRepository.update as jest.Mock).mockResolvedValue({
        ...mockLead,
        ...updateData,
      });
      const result = await LeadService.update(1, updateData);
      expect(result.first_name).toBe('Updated');
      expect(LeadRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('remove', () => {
    it('should delete a lead', async () => {
      (LeadRepository.remove as jest.Mock).mockResolvedValue(mockLead);
      const result = await LeadService.remove(1);
      expect(result).toEqual(mockLead);
      expect(LeadRepository.remove).toHaveBeenCalledWith(1);
    });
  });
});
