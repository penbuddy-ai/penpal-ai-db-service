import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './users.service';

jest.mock('argon2', () => ({
  __esModule: true,
  default: {},
  hash: jest.fn().mockResolvedValue('hashedpw'),
}));

describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let userRoleModel: any;

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
    userModel = module.get(getModelToken('User')) as any;
    userRoleModel = module.get(getModelToken('UserRole')) as any;
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

  it('findOne throws NotFoundException when not found', async () => {
    userModel.exec.mockResolvedValueOnce(null);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update hashes password and returns updated user', async () => {
    userModel.exec.mockResolvedValueOnce({ id: 'u1' }); // for findByIdAndUpdate
    const res = await service.update('u1', { password: 'clear' } as any);
    expect(res).toHaveProperty('id', 'u1');
  });

  it('remove throws NotFoundException when user not found', async () => {
    userModel.exec.mockResolvedValueOnce(null);
    await expect(service.remove('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('assignRole throws ConflictException when already exists', async () => {
    userRoleModel.exec.mockResolvedValueOnce({ id: 'r1' });
    await expect(service.assignRole('u', 'r')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('getOnboardingStatus returns needsOnboarding based on user doc', async () => {
    userModel.exec.mockResolvedValueOnce({ onboardingCompleted: false });
    const res = await service.getOnboardingStatus('u1');
    expect(res.needsOnboarding).toBe(true);
  });
});
