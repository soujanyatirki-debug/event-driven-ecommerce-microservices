import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kafka } from 'kafkajs';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderKafkaHandler } from './messaging/kafka.handler';
import { OrderSagaOrchestrator } from './order-saga.orchestrator';
import { OutboxEvent } from './outbox/outbox-event.entity';
import { OutboxService } from './outbox/outbox.service';
import { Order } from './orders/order.entity';
import { KafkaProducerService } from '@app/events';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get<string>('POSTGRES_DB', 'ecommerce'),
        entities: [OutboxEvent, Order],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([OutboxEvent, Order]),
  ],

  controllers: [AppController],

  providers: [
    AppService,
    OrderKafkaHandler,
    OrderSagaOrchestrator,
    OutboxService,
    KafkaProducerService,

    {
      provide: Kafka,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const brokers = configService
          .get<string>('KAFKA_BROKERS', 'localhost:9092')
          .split(',')
          .map((broker) => broker.trim())
          .filter(Boolean);

        return new Kafka({
          clientId: configService.get<string>('KAFKA_CLIENT_ID', 'order-service'),
          brokers,
        });
      },
    },
  ],
})
export class AppModule {}
