import { CredentialsError } from './../../enum/error-codes/credentials/credentials-error.enum';
import { UpdateCredentialsDto } from 'src/dto/credentials/update-credentials.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { Credentials } from '@prisma/client';
import { CredentialsService } from './credentials.service';
import { PublicCredentials } from 'src/dto/credentials/public-credentials.dto';
import { FetchCredentialsDto } from 'src/dto/credentials/fetch-credentials.dto';
import { AccountService } from '../account/account.service';

/**
 * Service Implementation for Credentials Module.
 */
@Controller('v1/credentials')
@UseGuards(AuthGuard)
export class CredentialsController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Controller Implementation for fetching user.
   * @param fetchCredentialsDto DTO Implementation for fetching user.
   * @returns Public Credentials.
   */
  @Get()
  public async fetchCredentials(
    @Query() fetchCredentialsDto: FetchCredentialsDto,
  ): Promise<PublicCredentials> {
    // Fetch user details.
    const credentials = await this.credentialsService.getCredential({
      id: (
        await this.accountService.getUser({
          where: {
            id: fetchCredentialsDto.accountId,
          },
        })
      ).credentialsId,
    });

    // If credentials not found, send error.
    if (!credentials) {
      throw new NotFoundException({
        message: CredentialsError.CREDENTIALS_NOT_FOUND,
      });
    }

    // Return result.
    return PublicCredentials.toDto(credentials);
  }

  /**
   * Controller Implementation for searching users.
   * @param user Logged In User.
   * @param search Search String.
   * @returns User Search Results.
   */
  @Get('filter/:search')
  public async searchCredentials(
    @User() user: Credentials,
    @Param('search') search: string,
  ): Promise<PublicCredentials[]> {
    // Search users across database who are not the logged in user.
    const credentials = await this.credentialsService.getCredentials({
      where: {
        id: {
          not: user.id,
        },
        OR: [
          {
            username: {
              contains: search,
            },
          },
          {
            account: {
              fullName: {
                contains: search,
              },
            },
          },
        ],
      },
      include: {
        account: true,
      },
    });

    // Map it to the public credentials model.
    const publicCredentials = credentials.map((credential) =>
      PublicCredentials.toDto(credential),
    );

    // Return results.
    return publicCredentials;
  }

  /**
   * Controller Implementation for credentials update.
   * @param user Logged In User
   * @param updateCredentialsDto DTO Implementation for credentials update.
   * @returns Updated Login String.
   */
  @Put()
  public async updateCredentials(
    @User() user: Credentials,
    @Body() updateCredentialsDto: UpdateCredentialsDto,
  ): Promise<{ token: string }> {
    return await this.credentialsService.updateCredentialsRequest(
      user,
      updateCredentialsDto,
    );
  }
}
