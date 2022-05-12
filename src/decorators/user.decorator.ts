import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Fetches the currently logged in user
 * from the request context
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Switch context and extract user header from the request.
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
