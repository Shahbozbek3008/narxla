import { Global, Module } from '@nestjs/common';
import { SessionGuard } from './session.guard.js';
import { SessionsService } from './sessions.service.js';

@Global()
@Module({
  providers: [SessionsService, SessionGuard],
  exports: [SessionsService, SessionGuard],
})
export class SessionsModule {}
