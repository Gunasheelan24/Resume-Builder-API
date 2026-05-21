import { LoggerService } from './common/logger/logger.service';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Cors Error
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // logger pipe
  app.useLogger(app.get(LoggerService));

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // application port
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.log('================== NESTJS Server Error ==================');
  console.log(error);
  console.log('================== NESTJS Server Error ==================');
});
