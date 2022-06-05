import { UpdateCredentialsDto } from 'src/dto/credentials/update-credentials.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { Credentials } from '@prisma/client';
import { CredentialsService } from './credentials.service';

@Controller('v1/credentials')
@UseGuards(AuthGuard)
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

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
