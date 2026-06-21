import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { ListDishDto } from './dto/list-dish.dto';
import { Auth } from '../auth/decorators';
import { GetLanguage } from 'src/common/decorators/get-language.decorator';
import { DishesService } from './dishes.service';
import { PaginatedResponseDto } from 'src/common/dtos/paginate-response.dto';
import { ApiResponseDto } from 'src/common/dtos/api-response.dto';

@ApiTags('Dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @Auth()
  @ApiResponse({ status: 201, description: 'Dish was created', type: Dish })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  create(
    @Body() createDishDto: CreateDishDto,
    @GetLanguage() language: string,
  ) {
    return this.dishesService.create(createDishDto, language);
  }

  @Get()
  findAll(
    @Query() listDishDto: ListDishDto,
    @GetLanguage() language: string,
  ) {
    return this.dishesService.findAll(listDishDto, language);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetLanguage() language: string,
  ) {
    return this.dishesService.findOne(id, language);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDishDto: UpdateDishDto,
    @GetLanguage() language: string,
  ) {
    return this.dishesService.update(id, updateDishDto, language);
  }
}
