import { CreateDishDto } from './create-dish.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateDishDto extends PartialType(CreateDishDto) {}
