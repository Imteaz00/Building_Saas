import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserType } from 'src/interfaces/active-user.interface';

export const ActiveUser = createParamDecorator(
  (user: any, context: ExecutionContext): ActiveUserType => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
