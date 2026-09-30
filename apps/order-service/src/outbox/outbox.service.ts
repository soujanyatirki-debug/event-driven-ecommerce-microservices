import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { KafkaProducerService, KafkaTopic } from '@app/events';

import { OutboxEvent } from './outbox-event.entity';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly repository: Repository<OutboxEvent>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async saveEvent(
    topic: KafkaTopic,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<OutboxEvent> {
    const event = this.repository.create({
      topic,
      eventType,
      payload,
      published: false,
      retryCount: 0,
      lastError: null,
      publishedAt: null,
    });

    return this.repository.save(event);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async publishPendingEvents(): Promise<void> {
    const events = await this.repository.find({
      where: { published: false },
      order: { createdAt: 'ASC' },
      take: 50,
    });

    for (const event of events) {
      try {
        await this.kafkaProducer.emit(event.topic as KafkaTopic, event.payload);

        event.published = true;
        event.publishedAt = new Date();
        event.lastError = null;

        await this.repository.save(event);

        this.logger.log(`Published outbox event ${event.id} to ${event.topic}`);
      } catch (error) {
        event.retryCount += 1;
        event.lastError = error instanceof Error ? error.message : String(error);

        await this.repository.save(event);

        this.logger.error(`Failed to publish outbox event ${event.id}: ${event.lastError}`);
      }
    }
  }
}
