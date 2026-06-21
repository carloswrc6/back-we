import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { MealType } from 'src/common/enums/meal-type';

export class ListDishDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by country ID',
  })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by meal type',
    enum: MealType,
  })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
