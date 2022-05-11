import { Module } from '@nestjs/common';
import { DummyService } from './dummy.service';

@Module({
  providers: [DummyService],
})
export class DummyModule {}
