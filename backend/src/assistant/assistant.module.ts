import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller.js';
import { SpeechService } from './speech.service.js';

@Module({
  controllers: [AssistantController],
  providers: [SpeechService],
})
export class AssistantModule {}
