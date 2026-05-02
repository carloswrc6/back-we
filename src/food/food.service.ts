import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Food } from './entities/food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';
import { handleDBExceptions } from 'src/common/exceptions/db-exception.handler';
import { PaginatedResponseDto } from 'src/common/dtos/paginate-response.dto';

@Injectable()
export class FoodsService {
  private readonly logger = new Logger('FoodsService');

  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createFoodDto: CreateFoodDto, user: User) {
    try {
      const { ...foodDetails } = createFoodDto;

      const food = this.foodRepository.create({
        ...foodDetails,
      });

      await this.foodRepository.save(food);

      return { ...food };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [foods, total] = await this.foodRepository.findAndCount({
      take: limit,
      skip: offset,
    });

    return {
      data: foods.map((food) => ({
        ...food,
      })),
      meta: {
        total,
        limit,
        offset,
        currentPage: Math.floor(offset / limit) + 1,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(term: string) {
    let food: Food;

    if (isUUID(term)) {
      food = await this.foodRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.foodRepository.createQueryBuilder('food');
      food = await queryBuilder
        .where('name ILIKE :name', {
          name: `%${term}%`,
        })
        .getOne(); // 1
      // .getMany(); 1:M
    }

    if (!food) throw new NotFoundException(`Food with ${term} not found`);

    return food;
  }

  async findOnePlain(term: string) {
    const { ...rest } = await this.findOne(term);
    return {
      ...rest,
    };
  }

  async update(id: string, updateFoodDto: UpdateFoodDto, user: User) {
    const { ...toUpdate } = updateFoodDto;

    const food = await this.foodRepository.preload({ id, ...toUpdate });

    if (!food) throw new NotFoundException(`Food with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(food);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      handleDBExceptions(error, this.logger);
    }
  }
}
