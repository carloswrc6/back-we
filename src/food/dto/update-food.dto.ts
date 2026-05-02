import { CreateFoodDto } from './create-food.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateFoodDto extends PartialType(CreateFoodDto) {}
