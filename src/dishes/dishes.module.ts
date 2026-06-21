import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from './../auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { CountriesModule } from 'src/countries/countries.module';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';

@Module({
  controllers: [DishesController],
  providers: [DishesService],
  imports: [
    TypeOrmModule.forFeature([Dish]),
    AuthModule,
    CommonModule,
    CountriesModule,
  ],
  exports: [DishesService, TypeOrmModule],
})
export class DishesModule {}
