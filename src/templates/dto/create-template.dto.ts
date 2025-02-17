import {
  IsString,
  IsArray,
  IsUrl,
  IsEnum,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum AnswerType {
  SINGLE_LINE = 'single_line',
  MULTI_LINE = 'multi_line',
  INTEGER = 'integer',
  CHECKBOX = 'checkbox',
}

class CreateQuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(AnswerType)
  answerType: AnswerType;
}

export class CreateTemplateDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUrl()
  image: string;

  @IsString()
  topic: string;

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
