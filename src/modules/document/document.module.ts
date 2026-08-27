import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from './entities/document.entity';
import { DocumentLink } from './entities/link.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentLink])],
})
export class DocumentModule {}
