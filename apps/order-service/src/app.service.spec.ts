import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  const dataSourceMock = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return order-service health status', () => {
    const result = service.getHealth();

    expect(result).toEqual(
      expect.objectContaining({
        service: 'order-service',
        status: 'ok',
      }),
    );
  });
});