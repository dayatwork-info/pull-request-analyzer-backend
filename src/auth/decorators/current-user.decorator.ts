import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// This decorator extracts the user from the request object
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
