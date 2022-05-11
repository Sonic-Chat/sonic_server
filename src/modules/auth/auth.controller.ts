import { Credentials } from '@prisma/client';
import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { RegisterAccountDto } from 'src/dto/auth/register-account.dto';

/**
 * Controller Implementation for Authentication Module.
 */
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
