import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';

// Mock guard module path used by controller to avoid module resolution issues in tests
jest.mock(
  'src/common/guards/service-auth.guard',
  () => ({
    ServiceAuthGuard: class {},
  }),
  { virtual: true },
);

describe('UsersController', () => {
  let controller: any;
  let service: jest.Mocked<UserService>;

  beforeEach(() => {
    const { UsersController } = require('./users.controller');
    service = {
      create: jest.fn().mockResolvedValue({ id: 'u1', email: 'john@doe.com' }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'u1' }),
      findByEmail: jest
        .fn()
        .mockResolvedValue({ id: 'u1', email: 'john@doe.com' }),
      update: jest.fn().mockResolvedValue({ id: 'u1', firstName: 'Johnny' }),
      remove: jest.fn().mockResolvedValue(undefined),
      updateOnboardingProgress: jest.fn().mockResolvedValue({ id: 'u1' }),
      completeOnboarding: jest
        .fn()
        .mockResolvedValue({ id: 'u1', onboardingCompleted: true }),
      getOnboardingStatus: jest
        .fn()
        .mockResolvedValue({ needsOnboarding: false }),
      getUserMetrics: jest
        .fn()
        .mockResolvedValue({
          activeUsers: 0,
          totalUsers: 0,
          usersByLanguage: {},
          averageUserLevel: {},
        }),
    } as any;

    controller = new UsersController(service as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('findAll returns array', async () => {
    const res = await controller.findAll();
    expect(Array.isArray(res)).toBe(true);
  });
  it('findOne proxies to service', async () => {
    const res = await controller.findOne('u1');
    expect(service.findOne).toHaveBeenCalledWith('u1');
    expect(res).toHaveProperty('id', 'u1');
  });
  it('getUserMetrics returns shape', async () => {
    const res = await controller.getUserMetrics();
    expect(res).toHaveProperty('totalUsers');
  });
});
