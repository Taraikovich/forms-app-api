import { AnswerType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AnswerDto {
  @IsString()
  templateId: string;

  @IsString()
  questionId: string;

  @IsEnum(AnswerType)
  type: AnswerType;

  @IsOptional()
  @IsString()
  single_line?: string;

  @IsOptional()
  @IsString()
  multi_line?: string;

  @IsOptional()
  @IsNumber()
  integer?: number;

  @IsOptional()
  @IsBoolean()
  checkbox?: boolean;
}
