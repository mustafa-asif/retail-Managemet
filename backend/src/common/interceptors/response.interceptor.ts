import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  total?: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(res => {
        if (res && typeof res === 'object' && 'data' in res) {
          const body: any = { success: true, data: res.data };
          if ('total' in res) {
            body.total = res.total;
          }
          return body;
        }
        return { success: true, data: res };
      }),
    );
  }
}
