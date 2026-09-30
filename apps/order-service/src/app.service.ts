import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { KAFKA_TOPICS } from '@app/events';

import { Order } from './orders/order.entity';
import { OutboxEvent } from './outbox/outbox-event.entity';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHealth(): {
    service: string;
    status: string;
    timestamp: string;
  } {
    return {
      service: 'order-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async createOrder(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<{
    orderId: string;
    status: string;
    message: string;
  }> {
    const orderId = crypto.randomUUID();

    await this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        id: orderId,
        userId,
        productId,
        quantity,
        status: 'CREATED',
      });

      await manager.save(Order, order);

      const outboxEvent = manager.create(OutboxEvent, {
        topic: KAFKA_TOPICS.ORDER_CREATED,
        eventType: KAFKA_TOPICS.ORDER_CREATED,
        payload: {
          orderId,
          userId,
          productId,
          quantity,
        },
        published: false,
        retryCount: 0,
        lastError: null,
        publishedAt: null,
      });

      await manager.save(OutboxEvent, outboxEvent);
    });

    return {
      orderId,
      status: 'CREATED',
      message:
        'Order created and event stored in the transactional outbox',
    };
  }
}