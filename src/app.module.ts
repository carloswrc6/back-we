import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { CountriesModule } from './countries/countries.module';
import { DishesModule } from './dishes/dishes.module';
import { AvoidReasonsModule } from './avoid-reasons/avoid-reasons.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    ThrottlerModule.forRoot({ ttl: 60000, limit: 120 }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,      
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
    CommonModule,
    MailModule,
    CountriesModule,
    DishesModule,
    AvoidReasonsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
