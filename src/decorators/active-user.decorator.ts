import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserType } from 'src/interfaces/active-user.interface';

export const ActiveUser = createParamDecorator(
  (user: ActiveUserType, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
