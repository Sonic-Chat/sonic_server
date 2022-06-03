import { Account, Credentials } from '@prisma/client';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterAccountDto } from 'src/dto/auth/register-account.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { LoginAccountDto } from 'src/dto/auth/login-account.dto';

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
  @Post('credential')
  public async registerAccount(
    @Body() registerAccountDto: RegisterAccountDto,
  ): Promise<Account> {
    return await this.authService.registerAccount(registerAccountDto);
  }

  /**
   * Controller Implementation for user account login through Firebase custom token generation.
   * @param loginAccountDto DTO Object for logging into account.
   * @returns Object containing auth token.
   */
  @Post('token')
  public async generateCustomToken(
    @Body() loginAccountDto: LoginAccountDto,
  ): Promise<{ token: string }> {
    return await this.authService.generateCustomToken(loginAccountDto);
  }
}
