import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

export const AnonymousProfile = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.cookies['anonymous-id'] as string | null;
  },
);
