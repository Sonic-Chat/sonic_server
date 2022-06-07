import { AccountService } from './../account/account.service';
import { Account, Credentials } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterAccountDto } from 'src/dto/auth/register-account.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { CredentialsService } from '../credentials/credentials.service';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import * as bcrypt from 'bcrypt';
import { LoginAccountDto } from 'src/dto/auth/login-account.dto';

/**
 * Service Implementation for Authentication Module.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly accountService: AccountService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Service Implementation for registering a new account.
   * @param registerAccountDto DTO Object for Registering a new account
   * @returns Credentials Object
   */
  public async registerAccount(
    registerAccountDto: RegisterAccountDto,
  ): Promise<Account> {
    // Checking for duplicate accounts under the same email address.
    const checkEmailCredentials = await this.credentialsService.getCredential({
      emailAddress: registerAccountDto.email,
    });

    if (checkEmailCredentials) {
      // Return error for duplicate email address.
      throw new BadRequestException({
        message: AuthError.ACCOUNT_ALREADY_EXISTS_FOR_EMAIL,
      });
    }

    // Checking for duplicate accounts under the same username.
    const checkUsernameCredentials =
      await this.credentialsService.getCredential({
        username: registerAccountDto.username,
      });

    if (checkUsernameCredentials) {
      // Return error for duplicate username.
      throw new BadRequestException({
        message: AuthError.ACCOUNT_ALREADY_EXISTS_FOR_USERNAME,
      });
    }

    // Register a new account with Firebase.
    const firebaseUser = await this.firebaseService.firebaseAuth.createUser({
      email: registerAccountDto.email,
      displayName: registerAccountDto.fullName,
    });

    // Hashing the password.
    const passwordHash = await bcrypt.hash(registerAccountDto.password, 10);

    // Save credentials along with account details in database.
    const savedCredentials = await this.credentialsService.createCredential({
      firebaseId: firebaseUser.uid,
      emailAddress: firebaseUser.email,
      username: registerAccountDto.username,
      password: passwordHash,
      account: {
        create: {
          fullName: firebaseUser.displayName,
          imageUrl: registerAccountDto.imageUrl,
        },
      },
    });

    const newAccount = await this.accountService.getUser({
      where: {
        credentialsId: savedCredentials.id,
      },
    });

    // Return credentials.
    return newAccount;
  }

  /**
   * Service Implementation for user account login through Firebase custom token generation.
   * @param loginAccountDto DTO Object for logging into account.
   * @returns Object containing auth token.
   */
  public async generateCustomToken(
    loginAccountDto: LoginAccountDto,
  ): Promise<{ token: string }> {
    // Fetch crednetials from the database.
    const credentials = await this.credentialsService.getCredential({
      username: loginAccountDto.username,
    });

    // Check if credentials exist in the database else throw an HTTP Exception.
    if (!credentials) {
      throw new BadRequestException({
        message: AuthError.ACCOUNT_DOES_NOT_EXIST,
      });
    }

    // Compare if the passwords match.
    const passwordMatch = await bcrypt.compare(
      loginAccountDto.password,
      credentials.password,
    );

    // If passwords don't match, throw an HTTP Exception.
    if (!passwordMatch) {
      throw new BadRequestException({
        message: AuthError.WRONG_PASSWORD,
      });
    }

    // Generate a custom firebase token for the client to log in.
    const firebaseToken =
      await this.firebaseService.firebaseAuth.createCustomToken(
        credentials.firebaseId,
      );

    // Return the token as an object.
    return { token: firebaseToken };
  }

  /**
   * Service Implementation for user account retrieval.
   * @param user Request User Object
   * @returns Credentials object with user details.
   */
  public async getUser(user: Credentials): Promise<Account> {
    // Return corresponding account object to client.
    return await this.accountService.getUser({
      where: {
        credentialsId: user.id,
      },
    });
  }
}
