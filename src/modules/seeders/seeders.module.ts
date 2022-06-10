import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SeedersService } from './seeders.service';

@Module({
  imports: [AuthModule],
  providers: [SeedersService],
})
export class SeedersModule {}
