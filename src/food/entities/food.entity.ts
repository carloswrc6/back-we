import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FoodType } from 'src/common/enums/food-type';

@Entity({ name: 'foods' })
export class Food {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    description: 'Food ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Pollo a la plancha',
    description: 'Food name',
  })
  @Column('text')
  name: string;

  @ApiProperty({
    example: 'almuerzo',
    description: 'Tipo de comida: desayuno, almuerzo, cena, snack',
  })
  @Column({
    type: 'enum',
    enum: FoodType,
  })
  @ApiProperty({
    example: true,
    description: 'Indica si es favorito',
  })
  @Column('bool', {
    default: false,
  })
  isFavorite: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si es saludable',
  })
  @Column('bool', {
    default: false,
  })
  isHealthy: boolean;

  @ApiProperty({
    example: 350,
    description: 'Cantidad de calorías',
  })
  @Column('int')
  calories: number;
}
