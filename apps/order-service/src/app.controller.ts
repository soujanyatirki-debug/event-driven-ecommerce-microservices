import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  getHealth(): {
    service: string;
    status: string;
    timestamp: string;
  } {
    return this.appService.getHealth();
  }

  @Post('/orders')
  createOrder(
    @Body()
    body: {
      userId: string;
      productId: string;
      quantity: number;
    },
  ) {
    return this.appService.createOrder(
      body.userId,
      body.productId,
      body.quantity,
    );
  }
}