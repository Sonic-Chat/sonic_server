import { Module, Global } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Global()
@Module({
  providers: [AccountService],
  exports: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
