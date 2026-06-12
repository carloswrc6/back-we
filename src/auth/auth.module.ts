import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Plan } from 'src/subscription/entities/plan.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([User, Plan, Subscription]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log('JWT Secret', configService.get('JWT_SECRET') )
        // console.log('JWT SECRET', process.env.JWT_SECRET)
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),

    MailModule,
    // JwtModule.register({
    // secret: process.env.JWT_SECRET,
    // signOptions: {
    //   expiresIn:'2h'
    // }
    // })
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
