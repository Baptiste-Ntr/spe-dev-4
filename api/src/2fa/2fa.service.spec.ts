import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthService } from './2fa.service';

describe('TwoFactorAuthService', () => {
  let service: TwoFactorAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwoFactorAuthService],
    }).compile();

    service = module.get<TwoFactorAuthService>(TwoFactorAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
