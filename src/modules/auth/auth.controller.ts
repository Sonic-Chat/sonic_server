import { Account, Credentials } from '@prisma/client';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterAccountDto } from 'src/dto/auth/register-account.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';

/**
 * Controller Implementation for Authentication Module.
 */
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Controller Implementation for user account retrieval.
   * @param user Request User Object
   * @returns Account Object with User Details
   */
  @Get('identity')
  @UseGuards(AuthGuard)
  public async identity(@User() user: Credentials): Promise<Account> {
    return await this.authService.getUser(user);
  }

  /**
   * Controller Implementation for registering a new account.
   * @param registerAccountDto DTO Object for registering a new account.
   * @returns Credentials object.
   */
  @Post('register')
  public async registerAccount(
    @Body() registerAccountDto: RegisterAccountDto,
  ): Promise<Credentials> {
    return await this.authService.registerAccount(registerAccountDto);
  }
}
