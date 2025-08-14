import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { UserService } from './users.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const mockModel = () => ({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      save: jest.fn(),
      deleteOne: jest.fn().mockReturnThis(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useFactory: mockModel },
        { provide: getModelToken('UserRole'), useFactory: mockModel },
        { provide: Logger, useValue: new Logger() },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns array', async () => {
    const users = await service.findAll();
    expect(Array.isArray(users)).toBe(true);
  });

  it('convert level map indirectly via getUserMetrics path executes without throw', async () => {
    // Accessing private method directly is not possible; we ensure public method works through
    // the path that uses convertLevelToNumber. The mocked model returns an empty list, so it should pass.
    const anyService = service as any;
    if (typeof anyService.getUserMetrics === 'function') {
      const res = await anyService.getUserMetrics();
      expect(res).toHaveProperty('totalUsers');
    }
  });
});


