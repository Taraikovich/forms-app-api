import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnswerDto } from './dto/answer.dto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFormWithAnswers(answersData: AnswerDto[], creatorId: string) {
    const templateId = answersData[0].templateId;

    return this.prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          templateId,
          creatorId,
        },
      });

      const answersToSave = answersData.map((answer) => ({
        formId: form.id,
        questionId: answer.questionId,
        type: answer.type,
        single_line: answer.single_line || null,
        multi_line: answer.multi_line || null,
        integer: answer.integer || null,
        checkbox: answer.checkbox || null,
      }));

      await tx.answer.createMany({ data: answersToSave });

      return {
        message: 'Form and answers saved successfully!',
        formId: form.id,
      };
    });
  }

  async getFormsByTemplateAuthor(templateAuthorId: string) {
    return await this.prisma.form.findMany({
      where: {
        template: {
          creatorId: templateAuthorId,
        },
      },
      include: {
        template: {
          select: {
            title: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getForm(formId: string) {
    return await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
        template: true,
      },
    });
  }
}
