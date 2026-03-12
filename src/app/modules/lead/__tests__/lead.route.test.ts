import request from 'supertest';
import app from '../../../../app';
import * as LeadService from '../lead.service';

// Mock LeadService
jest.mock('../lead.service');

// Mock auth middleware
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = {
      id: 1,
      role: 'admin',
      permissions: ['view_leads', 'manage_leads'],
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

describe('Lead Routes', () => {
  const mockLead = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
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

  describe('GET /api/v1/leads/', () => {
    it('should return all leads with pagination', async () => {
      (LeadService.findAll as jest.Mock).mockResolvedValue(mockPaginatedResult);
      const response = await request(app).get('/api/v1/leads/');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockPaginatedResult.data);
    });
  });

  describe('GET /api/v1/leads/:id', () => {
    it('should return a lead by id', async () => {
      (LeadService.findById as jest.Mock).mockResolvedValue(mockLead);
      const response = await request(app).get('/api/v1/leads/1');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockLead);
    });
  });

  describe('POST /api/v1/leads/', () => {
    it('should create a new lead', async () => {
      const leadData = { first_name: 'Jane', email: 'jane@example.com' };
      (LeadService.create as jest.Mock).mockResolvedValue({
        ...mockLead,
        ...leadData,
      });
      const response = await request(app).post('/api/v1/leads/').send(leadData);
      expect(response.status).toBe(201);
      expect(response.body.data.first_name).toBe('Jane');
    });
  });

  describe('PATCH /api/v1/leads/:id', () => {
    it('should update a lead', async () => {
      const updateData = { first_name: 'Updated' };
      (LeadService.update as jest.Mock).mockResolvedValue({
        ...mockLead,
        ...updateData,
      });
      const response = await request(app)
        .patch('/api/v1/leads/1')
        .send(updateData);
      expect(response.status).toBe(200);
      expect(response.body.data.first_name).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/leads/:id', () => {
    it('should delete a lead', async () => {
      (LeadService.remove as jest.Mock).mockResolvedValue(mockLead);
      const response = await request(app).delete('/api/v1/leads/1');
      expect(response.status).toBe(200);
    });
  });
});
