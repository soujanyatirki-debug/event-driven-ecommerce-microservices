import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Global interceptor that logs HTTP method, URL, duration and request-id.
 *
 * GraphQL requests use a different execution context, so they are logged
 * separately without trying to access an HTTP request object.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();

    // GraphQL uses a different execution context than HTTP.
    if ((context.getType() as string) === 'graphql') {
      return next.handle().pipe(
        tap(() => {
          this.logger.log(`GraphQL request completed in ${Date.now() - now}ms`);
        }),
      );
    }

    const request = context.switchToHttp().getRequest<{
      method?: string;
      originalUrl?: string;
      requestId?: string;
    }>();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `${request.method ?? 'UNKNOWN'} ${
              request.originalUrl ?? '/'
            } ${Date.now() - now}ms requestId=${request.requestId ?? 'unknown'}`,
          ),
        ),
      );
  }
}
