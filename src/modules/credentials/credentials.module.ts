import { Module, Global, forwardRef } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  providers: [CredentialsService],
  exports: [CredentialsService],
  controllers: [CredentialsController],
})
export class CredentialsModule {}
