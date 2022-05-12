import { Module, Global } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Global()
@Module({
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
