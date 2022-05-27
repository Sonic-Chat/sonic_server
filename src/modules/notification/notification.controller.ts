import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Credentials, Token } from '@prisma/client';
import { User } from 'src/decorators/user.decorator';
import { SaveTokenDto } from 'src/dto/token/save-token.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotificationService } from './notification.service';

@Controller('v1/notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('token')
  public async saveToken(
    @User() user: Credentials,
    @Body() saveTokenDto: SaveTokenDto,
  ): Promise<Token> {
    return await this.notificationService.saveToken(user, saveTokenDto);
  }
}
