import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AnonymousIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    // Check if anonymous-id cookie already exists
    let anonymousId = request.cookies['anonymous-id'];

    // If not, generate a new one and set it
    if (!anonymousId) {
      anonymousId = randomUUID();
      
      // Set cookie with appropriate options
      response.cookie('anonymous-id', anonymousId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });

      // Also set it on the request object so it can be used in this request
      request.cookies['anonymous-id'] = anonymousId;
    }

    return next.handle();
  }
}
