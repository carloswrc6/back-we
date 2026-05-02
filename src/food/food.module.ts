import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from './../auth/auth.module';

import { FoodsController } from './food.controller';
import { FoodsService } from './food.service';
import { Food } from './entities/food.entity';


@Module({
  controllers: [FoodsController],
  providers: [FoodsService],
  imports: [
    TypeOrmModule.forFeature([ Food ]),
    AuthModule,
  ],
  exports: [
    FoodsService,
    TypeOrmModule,
  ]
})
export class FoodsModule {}
