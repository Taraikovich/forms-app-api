import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { FormsService } from './forms.service';
import { AnswerDto } from './dto/answer.dto';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post('save-form')
  saveForm(
    @Request() req: { user: { id: string } },
    @Body() answersData: AnswerDto[],
  ) {
    return this.formsService.saveFormWithAnswers(answersData, req.user.id);
  }

  @Get('by-template-author')
  getFormsByTemplateAuthor(@Request() req: { user: { id: string } }) {
    return this.formsService.getFormsByTemplateAuthor(req.user.id);
  }

  @Get('form/:id')
  getForm(@Param() params: { id: string }) {
    return this.formsService.getForm(params.id);
  }
}
