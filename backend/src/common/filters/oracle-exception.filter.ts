import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class OracleExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'DB_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
      code = typeof res === 'object' && (res as any).code ? (res as any).code : 'HTTP_ERROR';
    } else if (exception && exception.errorNum) {
      if (exception.errorNum === 20001) {
        status = HttpStatus.BAD_REQUEST;
        code = 'INSUFFICIENT_STOCK';
        message = exception.message;
      } else if (exception.errorNum === 20002) {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = exception.message;
      } else if (exception.errorNum === 20003) {
        status = HttpStatus.BAD_REQUEST;
        code = 'INVALID_QUANTITY';
        message = exception.message;
      } else {
        message = exception.message || 'Database error occurred';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      code,
      statusCode: status,
    });
  }
}
