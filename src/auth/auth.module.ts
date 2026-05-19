import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/common/util/env.constants';
import { GoogleStrategyService } from './strategy/google.strategy.service';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategyService } from './strategy/github.strategy.service';
import { OtpEntity } from './entities/otp';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OtpEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>(ENV.JWT_SECRET) as string,
          signOptions: {
            expiresIn: configService.get(ENV.JWT_EXPIRE),
          },
        };
      },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategyService, GithubStrategyService],
})
export class AuthModule {}
