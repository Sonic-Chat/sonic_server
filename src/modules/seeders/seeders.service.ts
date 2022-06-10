import { RegisterAccountDto } from './../../dto/auth/register-account.dto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CredentialsService } from '../credentials/credentials.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SeedersService implements OnModuleInit {
  private dummyUsers: RegisterAccountDto[] = [
    {
      email: 'jesus.morgan@example.com',
      username: 'jesus.morgan',
      password: 'password123',
      fullName: 'Jesus Morgan',
      imageUrl: 'https://randomuser.me/api/portraits/men/82.jpg',
    },
    {
      email: 'chloe.garza@example.com',
      username: 'chloe.garza',
      password: 'password123',
      fullName: 'Chloe Garza',
      imageUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
    },
    {
      email: 'brian.wade@example.com',
      username: 'brian.wade',
      password: 'password123',
      fullName: 'Brian Wade',
      imageUrl: 'https://randomuser.me/api/portraits/men/24.jpg',
    },
    {
      email: 'maureen.moore@example.com',
      username: 'maureen.moore',
      password: 'password123',
      fullName: 'Maureen Moore',
      imageUrl: 'https://randomuser.me/api/portraits/women/43.jpg',
    },
    {
      email: 'lawrence.rhodes@example.com',
      username: 'lawrence.rhodes',
      password: 'password123',
      fullName: 'Lawrence Rhodes',
      imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
    },
    {
      email: 'herman.matthews@example.com',
      username: 'herman.matthews',
      password: 'password123',
      fullName: 'Herman Matthews',
      imageUrl: 'https://randomuser.me/api/portraits/men/79.jpg',
    },
    {
      email: 'sofia.lopez@example.com',
      username: 'sofia.lopez',
      password: 'password123',
      fullName: 'Sofia Lopez',
      imageUrl: 'https://randomuser.me/api/portraits/women/19.jpg',
    },
    {
      email: 'gavin.butler@example.com',
      username: 'gavin.butler',
      password: 'password123',
      fullName: 'Gavin Butler',
      imageUrl: 'https://randomuser.me/api/portraits/men/92.jpg',
    },
    {
      email: 'francisco.stanley@example.com',
      username: 'francisco.stanley',
      password: 'password123',
      fullName: 'Francisco Stanley',
      imageUrl: 'https://randomuser.me/api/portraits/men/35.jpg',
    },
    {
      email: 'lewis.walters@example.com',
      username: 'lewis.walters',
      password: 'password123',
      fullName: 'Lewis Walters',
      imageUrl: 'https://randomuser.me/api/portraits/men/98.jpg',
    },
  ];

  private logger = new Logger(SeedersService.name);

  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly authService: AuthService,
  ) {}
  async onModuleInit() {
    this.logger.log('Seeding Accounts');
    await this.seedAccounts();
    this.logger.log('Seeded Accounts');
  }

  private async seedAccounts(): Promise<void> {
    for (const dummyUser of this.dummyUsers) {
      const checkUser = await this.credentialsService.getCredential({
        username: dummyUser.username,
      });

      if (!checkUser) {
        await this.authService.registerAccount(dummyUser);
      }
    }
  }
}
