import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { CountriesModule } from './countries/countries.module';
import { DishesModule } from './dishes/dishes.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

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

    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname,'..','public'), 
    // }),

    AuthModule,
    CommonModule,
    MailModule,
    CountriesModule,
    DishesModule,
  ],
})
export class AppModule {}
