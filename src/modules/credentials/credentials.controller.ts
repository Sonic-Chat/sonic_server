import { UpdateCredentialsDto } from 'src/dto/credentials/update-credentials.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { Credentials } from '@prisma/client';
import { CredentialsService } from './credentials.service';
import { PublicCredentials } from 'src/dto/credentials/public-credentials.dto';

/**
 * Service Implementation for Credentials Module.
 */
@Controller('v1/credentials')
@UseGuards(AuthGuard)
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  /**
   * Controller Implementation for searching users.
   * @param user Logged In User.
   * @param search Search String.
   * @returns User Search Results.
   */
  @Get('filter/:search')
  public async searchUsers(
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
