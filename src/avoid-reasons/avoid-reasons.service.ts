import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvoidReason } from './entities/avoid-reason.entity';

@Injectable()
export class AvoidReasonsService implements OnModuleInit {
  private readonly defaultReasons: Partial<AvoidReason>[] = [
    {
      key: 'taste',
      labelEn: 'Taste',
      labelEs: 'Sabor',
      descriptionEn:
        'The flavor is unpleasant (too bitter, sour, sweet, salty, etc.)',
      descriptionEs:
        'El gusto resulta desagradable (muy amargo, ácido, dulce, salado, etc.)',
    },
    {
      key: 'texture',
      labelEn: 'Texture',
      labelEs: 'Textura',
      descriptionEn:
        'The mouthfeel is unpleasant (slimy, chewy, gritty, fibrous, etc.)',
      descriptionEs:
        'La sensación al masticar no agrada (babosa, gomosa, arenosa, fibrosa, etc.)',
    },
    {
      key: 'smell',
      labelEn: 'Smell',
      labelEs: 'Olor',
      descriptionEn: 'The aroma is too strong or unpleasant',
      descriptionEs: 'El aroma es demasiado fuerte o poco agradable',
    },
    {
      key: 'appearance',
      labelEn: 'Appearance',
      labelEs: 'Apariencia',
      descriptionEn:
        'The color, shape or presentation makes the food unappealing',
      descriptionEs:
        'El color, la forma o la presentación hacen que la comida no se vea apetecible',
    },
    {
      key: 'bad_experience',
      labelEn: 'Bad past experience',
      labelEs: 'Mala experiencia previa',
      descriptionEn:
        'Associated the food with illness, food poisoning or a negative memory',
      descriptionEs:
        'Haber asociado ese alimento con una enfermedad, intoxicación o recuerdo negativo genera rechazo',
    },
  ];

  constructor(
    @InjectRepository(AvoidReason)
    private readonly avoidReasonRepository: Repository<AvoidReason>,
  ) {}

  async onModuleInit() {
    const count = await this.avoidReasonRepository.count();
    if (count === 0) {
      await this.avoidReasonRepository.save(this.defaultReasons);
    }
  }

  async findAll(language: string) {
    const reasons = await this.avoidReasonRepository.find();
    return reasons.map((r) => ({
      key: r.key,
      label: language === 'es' ? r.labelEs : r.labelEn,
      description: language === 'es' ? r.descriptionEs : r.descriptionEn,
    }));
  }
}
