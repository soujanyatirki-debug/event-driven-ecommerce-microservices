import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface MetaPayload {
  requestId: string;
  timestamp: string;
}

/**
 * Wraps every successful HTTP response in a standard envelope:
 * `{ data, meta: { requestId, timestamp }, error: null }`.
 *
 * GraphQL responses are handled by Apollo and must not be wrapped here.
 */
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  { data: T; meta: MetaPayload; error: null } | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ data: T; meta: MetaPayload; error: null } | T> {
    // GraphQL has a different execution context from HTTP.
    // Let Apollo handle the GraphQL response normally.
    if ((context.getType() as string) === 'graphql') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{ requestId?: string }>();

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          requestId: request.requestId ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
        error: null,
      })),
    );
  }
}
