import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { ListDishDto } from './dto/list-dish.dto';
import { handleDBExceptions } from 'src/common/exceptions/db-exception.handler';
import { I18nService } from 'src/common/services/i18n.service';
import { CountriesService } from 'src/countries/countries.service';
import { MealType } from 'src/common/enums/meal-type';
import { dishesSeed } from './data/dishes-seed.data';

@Injectable()
export class DishesService implements OnModuleInit {
  private readonly logger = new Logger('DishesService');

  constructor(
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    private readonly i18nService: I18nService,
    private readonly countriesService: CountriesService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const count = await this.dishRepository.count();
    if (count > 0) {
      this.logger.log(`Dishes already seeded (${count} found)`);
      return;
    }

    const countries = await this.countriesService.findAll();
    const dishesToCreate: Dish[] = [];

    for (const country of countries) {
      const countryDishes = dishesSeed[country.code];
      if (!countryDishes) continue;

      for (const dish of countryDishes) {
        const newDish = this.dishRepository.create({
          name: dish.name,
          nameEn: dish.nameEn,
          image: dish.image,
          ingredients: dish.ingredients,
          ingredientsEn: dish.ingredientsEn,
          mealType: dish.mealType as MealType,
          countryId: country.id,
        });
        dishesToCreate.push(newDish);
      }
    }

    await this.dishRepository.save(dishesToCreate);
    this.logger.log(`Seeded ${dishesToCreate.length} dishes across ${countries.length} countries`);
  }

  async create(createDishDto: CreateDishDto, language: string) {
    try {
      const { nameEn, ingredientsEn, ...rest } = createDishDto;
      const dish = this.dishRepository.create({
        ...rest,
        ...(nameEn && { nameEn }),
        ...(ingredientsEn && { ingredientsEn }),
      });
      await this.dishRepository.save(dish);
      return {
        data: this.mapByLanguage(dish, language),
        message: this.i18nService.t('dishes.created', language as any),
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(listDishDto: ListDishDto, language: string) {
    const { limit = 10, offset = 0, countryId, mealType } = listDishDto;

    const where: any = {};
    if (countryId) where.countryId = countryId;
    if (mealType) where.mealType = mealType;

    const [dishes, total] = await this.dishRepository.findAndCount({
      take: limit,
      skip: offset,
      where,
      order: { name: 'ASC' },
    });

    return {
      data: dishes.map((dish) => this.mapByLanguage(dish, language)),
      meta: {
        total,
        limit,
        offset,
        currentPage: Math.floor(offset / limit) + 1,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(term: string, language: string) {
    const dish = await this.dishRepository.findOne({
      where: { id: term },
    });

    if (!dish) throw new NotFoundException(`Dish with id ${term} not found`);

    return this.mapByLanguage(dish, language);
  }

  async update(id: string, updateDishDto: UpdateDishDto, language: string) {
    const dish = await this.dishRepository.preload({
      id,
      ...updateDishDto,
    });

    if (!dish) throw new NotFoundException(`Dish with id ${id} not found`);

    try {
      await this.dishRepository.save(dish);
      return {
        data: this.mapByLanguage(dish, language),
        message: this.i18nService.t('dishes.updated', language as any),
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  private mapByLanguage(dish: Dish, language: string) {
    const { nameEn, ingredientsEn, ...rest } = dish;
    return {
      ...rest,
      name: language === 'en' && nameEn ? nameEn : rest.name,
      ingredients: language === 'en' && ingredientsEn?.length ? ingredientsEn : rest.ingredients,
      mealType: this.i18nService.t(`meal_types.${rest.mealType}`, language as any),
    };
  }
}
