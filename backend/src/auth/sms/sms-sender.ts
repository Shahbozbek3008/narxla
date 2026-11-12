import { Injectable, Logger } from '@nestjs/common';
import { maskPhone } from '../domain/phone.js';

export abstract class SmsSender {
  abstract send(phone: string, text: string): Promise<void>;
}

@Injectable()
export class LogSmsSender extends SmsSender {
  private readonly logger = new Logger('Sms');

  send(phone: string, text: string) {
    this.logger.warn(`SMS to ${maskPhone(phone)}: ${text}`);
    return Promise.resolve();
  }
}
