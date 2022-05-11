import { Credentials } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterAccountDto } from 'src/dto/auth/register-account.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { CredentialsService } from '../credentials/credentials.service';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';

/**
 * Service Implementation for Authentication Module.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Service Implementation for registering a new account.
   * @param registerAccountDto DTO Object for Registering a new account
   * @returns Credentials Object
   */
  public async registerAccount(
    registerAccountDto: RegisterAccountDto,
  ): Promise<Credentials> {
    // Checking for duplicatre accounts under the same email address.
    const checkCredentials = await this.credentialsService.getCredential({
      emailAddress: registerAccountDto.email,
    });

    if (checkCredentials) {
      // Return error for duplicate email address.
      throw new BadRequestException({
        message: AuthError.ACCOUNT_ALREADY_EXISTS_FOR_EMAIL,
      });
    }

    // Register a new account with Firebase.
    const firebaseUser = await this.firebaseService.firebaseAuth.createUser({
      email: registerAccountDto.email,
      password: registerAccountDto.password,
      displayName: registerAccountDto.fullName,
      photoURL: registerAccountDto.imageUrl,
    });

    // Save credentials along with account details in database.
    const savedCredentials = await this.credentialsService.createCredential({
      firebaseId: firebaseUser.uid,
      emailAddress: firebaseUser.email,
      account: {
        create: {
          fullName: firebaseUser.displayName,
          imageUrl: registerAccountDto.imageUrl,
        },
      },
    });

    // Return credentials.
    return savedCredentials;
  }

  public async getUser(user: Credentials): Promise<Credentials> {
    return await this.credentialsService.getCredential({
      firebaseId: user.firebaseId,
    });
  }
}
