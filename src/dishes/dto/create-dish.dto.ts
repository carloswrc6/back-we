import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { MealType } from 'src/common/enums/meal-type';

export class CreateDishDto {
  @ApiProperty({
    description: 'Dish name in Spanish',
    example: 'Ceviche',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({
    description: 'Dish name in English',
    example: 'Ceviche',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameEn?: string;

  @ApiProperty({
    description: 'Dish image URL',
    example: 'https://example.com/ceviche.jpg',
  })
  @IsString()
  @MinLength(1)
  image: string;

  @ApiProperty({
    description: 'List of ingredients in Spanish',
    example: ['pescado', 'limón', 'cebolla', 'cilantro'],
  })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @ApiPropertyOptional({
    description: 'List of ingredients in English',
    example: ['fish', 'lime', 'onion', 'cilantro'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredientsEn?: string[];

  @ApiProperty({
    description: 'Meal type',
    example: 'lunch',
    enum: MealType,
  })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({
    description: 'Country ID',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  @IsUUID()
  countryId: string;
}
