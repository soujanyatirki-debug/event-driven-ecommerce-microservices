import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';
import { OutboxService } from './outbox/outbox.service';

describe('AppService', () => {
  let service: AppService;

  const outboxServiceMock = {
    saveEvent: jest.fn(),
    publishPendingEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: OutboxService,
          useValue: outboxServiceMock,
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

    expect(result.service).toBe('order-service');
    expect(result.status).toBe('ok');
  });
});