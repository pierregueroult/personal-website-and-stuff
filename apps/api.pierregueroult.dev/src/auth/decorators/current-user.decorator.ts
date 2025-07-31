import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<Request>().user;
});
