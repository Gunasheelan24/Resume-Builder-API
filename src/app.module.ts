import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from './common/util/env.constants';
import { AuthModule } from './auth/auth.module';
import { LoggerService } from './common/logger/logger.service';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    // config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['development.env'],
    }),

    // typeOrm Config
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          database: configService.get<string>(ENV.DB_NAME),
          host: configService.get<string>(ENV.DB_HOST),
          port: configService.get<number>(ENV.DB_PORT),
          username: configService.get<string>(ENV.DB_USER),
          password: configService.get(ENV.DB_PASSWORD),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    AuthModule,

    LoggerModule,

    // other goes here
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
