import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';

import { CircuitBreakerService } from './common/circuit-breaker.service';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

import { ProductsResolver } from './graphql/products.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      playground: true,
    }),

    ThrottlerModule.forRoot([
      {
        limit: 100,
        ttl: 60000,
      },
    ]),

    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    UsersModule,
  ],

  providers: [
    CircuitBreakerService,
    ProductsResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}