import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post('create')
  createTemplate(
    @Request() req: { user: { id: string } },
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.templatesService.create(createTemplateDto, req.user.id);
  }

  @Public()
  @Get('latest')
  getTemplates() {
    return this.templatesService.getLatestTemplates();
  }

  @Public()
  @Get('template/:id')
  getTemplateById(@Param('id') id: string) {
    return this.templatesService.getTemplateById(id);
  }

  @Public()
  @Get('topics')
  getTopicList() {
    return this.templatesService.getTopicList();
  }

  @Get('user-templates')
  getTemplatesByUserId(
    @Request() req: { user: { id: string } },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.templatesService.getTemplateByUserId(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Public()
  @Get('tags/search')
  searchTags(@Query('q') query: string) {
    return this.templatesService.getTags(query);
  }

  @Delete('delete')
  deleteTemplates(@Body() body: string[]) {
    console.log(body);
    return this.templatesService.deleteTemplates(body);
  }
}
