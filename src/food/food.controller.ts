import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { Food } from './entities/food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { FoodsService } from './food.service';
import { PaginatedResponseDto } from 'src/common/dtos/paginate-response.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@ApiTags('Food')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @Auth()
  @ApiResponse({ status: 201, description: 'Food was created', type: Food })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  create(@Body() createFoodDto: CreateFoodDto, @GetUser() user: User) {
    return this.foodsService.create(createFoodDto, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Food>> {
    return this.foodsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.foodsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoodDto: UpdateFoodDto,
    @GetUser() user: User,
  ) {
    return this.foodsService.update(id, updateFoodDto, user);
  }

  // @Delete(':id')
  // @Auth( ValidRoles.admin )
  // remove(@Param('id', ParseUUIDPipe ) id: string) {
  //   return this.foodsService.remove( id );
  // }
}
