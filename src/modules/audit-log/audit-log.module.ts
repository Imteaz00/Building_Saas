import { Module } from '@nestjs/common';
import { AuditLog } from './audit-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
})
export class AuditLogModule {}
