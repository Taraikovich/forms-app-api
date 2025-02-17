import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTemplateDto: CreateTemplateDto, creatorId: string) {
    const tagsData =
      createTemplateDto.tags.length > 0
        ? {
            connectOrCreate: createTemplateDto.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          }
        : undefined;

    return await this.prisma.template.create({
      data: {
        title: createTemplateDto.title,
        description: createTemplateDto.description,
        image: createTemplateDto.image,
        topic: {
          connect: {
            id: createTemplateDto.topic,
          },
        },
        creator: {
          connect: { id: creatorId },
        },
        tags: tagsData,
        questions: {
          create: createTemplateDto.questions.map((question) => ({
            title: question.title,
            description: question.description,
            type: question.answerType,
          })),
        },
      },
    });
  }

  async getLatestTemplates() {
    return await this.prisma.template.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        image: true,
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getTemplateByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [count, templates] = await Promise.all([
      this.prisma.template.count({ where: { creatorId: userId } }),
      this.prisma.template.findMany({
        where: { creatorId: userId },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(count / limit);

    return { templates, count, totalPages, currentPage: page };
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: {
        id: id,
      },
      include: {
        questions: true,
        creator: {
          select: {
            email: true,
            name: true,
          },
        },
        topic: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!template) throw new NotFoundException('Template not found');

    return template;
  }

  async getTopicList() {
    return await this.prisma.topic.findMany();
  }

  async getTags(query: string) {
    return await this.prisma.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }

  async deleteTemplates(ids: string[]) {
    return await this.prisma.template.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
