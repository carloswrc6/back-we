import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { CountriesService } from './countries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CountriesService],
  exports: [TypeOrmModule, CountriesService],
})
export class CountriesModule {}
