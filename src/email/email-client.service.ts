import sendGrid, { type MailDataRequired } from '@sendgrid/mail';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import { HttpResponseFailedMessages } from 'src/common/util/constant';
import { ENV } from 'src/common/util/env.constants';
import { SendEmailType } from './types/email.types';

@Injectable({})
export class EmailClientService {
  private readonly logger = new LoggerService();
  constructor(private readonly configService: ConfigService) {
    const sendGridKey = configService.get(ENV.SENDGRID_SECRET) as string;
    sendGrid.setApiKey(sendGridKey);
  }

  // prepare E-Mail Method
  async prepareEmailObject(data: SendEmailType) {
    try {
      const fromMailAddress = this.configService.get(
        ENV.SENDGRID_EMAIL,
      ) as string;
      const templateId = this.configService.get(
        ENV.SENDGRID_TEMPLATE,
      ) as string;
      const uiUrl = this.configService.get(ENV.UI_URL) as string;

      const emailPayload: MailDataRequired = {
        from: fromMailAddress,
        to: data.to,
        templateId,
        dynamicTemplateData: {
          userName: data.userName,
          OTP_CODE: data.otp,
          RESET_URL: `${uiUrl}${'/auth/verify-otp'}`,
        },
        subject: data.subject,
      };
      const emailResponse = await this.sendEmail(emailPayload);

      // sent Back Response
      return emailResponse;
    } catch (exception) {
      if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.warn(HttpResponseFailedMessages.somethingWentWrong);
      }

      throw exception;
    }
  }

  // send E-Mail Method
  async sendEmail(data: MailDataRequired) {
    try {
      const sendEmail = await sendGrid.send(data);
      return sendEmail;
    } catch (exception) {
      if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.warn(HttpResponseFailedMessages.somethingWentWrong);
      }

      throw exception;
    }
  }
}
