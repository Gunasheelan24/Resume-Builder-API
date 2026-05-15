import * as winston from 'winston';
import { Injectable, LoggerService as nestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements nestLoggerService {
  // logger property
  private readonly logger = winston.createLogger({
    level: 'info',

    // here the formate for logger terminal
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ message, level, timestamp }: any) => {
        return `${message} - ${level} - ${timestamp}`;
      }),
    ),

    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  });

  log(message: string, stack?: string) {
    this.logger.info(message, {
      stack,
    });
  }

  warn(message: string, stack?: string) {
    this.logger.warn(message, {
      stack: stack,
    });
  }

  error(message: string, stack?: string) {
    this.logger.error(message, {
      stack: stack,
    });
  }
}
