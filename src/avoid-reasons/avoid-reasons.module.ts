import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvoidReasonsController } from './avoid-reasons.controller';
import { AvoidReasonsService } from './avoid-reasons.service';
import { AvoidReason } from './entities/avoid-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AvoidReason])],
  controllers: [AvoidReasonsController],
  providers: [AvoidReasonsService],
})
export class AvoidReasonsModule {}
