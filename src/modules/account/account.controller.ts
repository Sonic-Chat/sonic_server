import { CredentialsService } from './../credentials/credentials.service';
import { UpdateAccountDto } from './../../dto/user-account/update-account.dto';
import { Body, Controller, Delete, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountService } from './account.service';
import { Account, Credentials } from '@prisma/client';
import { User } from 'src/decorators/user.decorator';

/**
 * Controller Implementation for User Account Module.
 */
@Controller('v1/account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly credentialsService: CredentialsService,
  ) {}

  /**
   * Controller Implementation for user account update.
   * @param updateAccountDto DTO For Account Update.
   * @param user Logged In User Details.
   * @returns Update Account Details.
   */
  @Put()
  @UseGuards(AuthGuard)
  public async updateAccount(
    @Body() updateAccountDto: UpdateAccountDto,
    @User() user: Credentials,
  ): Promise<Account> {
    return await this.accountService.updateUser({
      where: {
        credentialsId: user.id,
      },
      data: {
        fullName: updateAccountDto.fullName,
        status: updateAccountDto.status,
        imageUrl: updateAccountDto.imageUrl,
      },
    });
  }

  /**
   * Controller Implementation for user account deletion.
   * @param user Logged In User Details
   */
  @Delete()
  @UseGuards(AuthGuard)
  public async deleteAccount(@User() user: Credentials): Promise<void> {
    return await this.credentialsService.deleteCredential({
      firebaseId: user.firebaseId,
    });
  }
}
