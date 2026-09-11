import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ActiveUserType } from 'src/interfaces/active-user.interface';

export const CompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const activeUser: ActiveUserType = request.user;

    if (activeUser.role === 'super-admin') {
      const companyId = request.body.companyId;
      if (!companyId) {
        throw new BadRequestException(
          'Company ID is required for super-admin users',
        );
      }
      return companyId;
    }

    return activeUser.companyId;
  },
);
