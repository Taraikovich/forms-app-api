import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TemplatesController],
  providers: [PrismaService, TemplatesService],
})
export class TemplatesModule {}
