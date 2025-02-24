import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UpdateTemplateDto } from './dto/update-template.dto';

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

  @Put('update/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
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

  @Get('all')
  getAllTemplates(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.templatesService.getAllTemplates(Number(page), Number(limit));
  }

  @Public()
  @Get('tags/search')
  searchTags(@Query('q') query: string) {
    return this.templatesService.getTags(query);
  }

  @Public()
  @Get('top')
  getTopTemplates() {
    return this.templatesService.getTopFiveTemplates();
  }

  @Public()
  @Get('top-tags')
  getTopTags() {
    return this.templatesService.getTopTags();
  }

  @Delete('delete')
  deleteTemplates(@Body() body: string[]) {
    console.log(body);
    return this.templatesService.deleteTemplates(body);
  }
}
