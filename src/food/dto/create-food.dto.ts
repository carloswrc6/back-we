import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { FoodType } from 'src/common/enums/food-type';

export class CreateFoodDto {

  @ApiProperty({
    description: 'Food name',
    example: 'Pollo a la plancha',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Tipo de comida',
    example: 'almuerzo',
  })
  @IsEnum(FoodType)
  type: FoodType;

  @ApiProperty({
    description: 'Indica si es favorito',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiProperty({
    description: 'Indica si es saludable',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isHealthy?: boolean;

  @ApiProperty({
    description: 'Cantidad de calorías',
    example: 350,
  })
  @IsInt()
  @IsPositive()
  calories: number; 
}