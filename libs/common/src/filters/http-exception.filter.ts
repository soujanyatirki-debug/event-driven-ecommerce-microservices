import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

const STATUS_CODE_MAP: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_ERROR',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if ((host.getType() as string) === 'graphql') {
      throw exception;
    }

    const context = host.switchToHttp();

    const response = context.getResponse<{
      status: (code: number) => {
        json: (payload: unknown) => void;
      };
    }>();

    const request = context.getRequest<{
      requestId?: string;
    }>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Unexpected internal server error';

    const code = STATUS_CODE_MAP[status] ?? 'INTERNAL_ERROR';

    response.status(status).json({
      error: {
        code,
        message,
        requestId: request.requestId ?? 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
