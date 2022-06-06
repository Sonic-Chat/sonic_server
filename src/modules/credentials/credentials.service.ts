import { CommonError } from './../../enum/error-codes/common/common-error.enum';
import { PrismaService } from './../prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, Credentials, Prisma } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateCredentialsDto } from 'src/dto/credentials/update-credentials.dto';
import * as bcrypt from 'bcrypt';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { AuthService } from '../auth/auth.service';
import { LoginAccountDto } from 'src/dto/auth/login-account.dto';

/**
 * Service Implementation for Credentials Module.
 */
@Injectable()
export class CredentialsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.prismaService.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.log('Query: ' + event.query);
      console.log('Duration: ' + event.duration + 'ms');
    });
  }

  /**
   * Service Implementation for fetching credentials.
   * @param where Query Parameters to fetch corresponding Credentials Object.
   * @returns Credentials object or null.
   */
  public async getCredential(
    where: Prisma.CredentialsWhereUniqueInput,
  ): Promise<Credentials | null> {
    // Pass the parameters and return the result.
    return await this.prismaService.credentials.findUnique({
      where,
      include: {
        account: true,
      },
    });
  }

  /**
   * Service Implementation for creation of credentials.
   * @param data Parameters to create Credentials object.
   * @returns Credentials Object.
   */
  public async createCredential(
    data: Prisma.CredentialsCreateInput,
  ): Promise<Credentials> {
    // Pass the parameters and return the result.
    return await this.prismaService.credentials.create({ data });
  }

  /**
   * Service Implementation for updating of credentials.
   * @param args Update Credentials Args.
   * @returns Credentials Object.
   */
  public async updateCredential(
    args: Prisma.CredentialsUpdateArgs,
  ): Promise<Credentials> {
    // Pass the parameters and return the result.
    return await this.prismaService.credentials.update(args);
  }

  /**
   * Service Implementation for deleting credentials and all user generated content.
   * @param where Query Parameters to delete corresponding Credentials Object.
   * @returns Credentials object.
   */
  public async deleteCredential(
    where: Prisma.CredentialsWhereUniqueInput,
  ): Promise<void> {
    // Fetching credentials record.
    const credentials = await this.getCredential(where);

    // Fetching account record.
    const account = await this.prismaService.account.findUnique({
      where: {
        credentialsId: credentials.id,
      },
    });

    // Build deletion transaction array.
    const transactions = await this.buildTransaction(account, credentials);

    // Executing a transaction deleting the all user generated content.
    await this.prismaService.$transaction([
      ...transactions,
      this.prismaService.account.delete({
        where: {
          credentialsId: credentials.id,
        },
      }),
      this.prismaService.credentials.delete({
        where: {
          id: credentials.id,
        },
      }),
    ]);

    // Delete Firebase Account.
    await this.firebaseService.firebaseAuth.deleteUser(where.firebaseId);
  }

  /**
   * Service Implementation for credentials update.
   * @param args Update Credentials Args.
   * @returns Credentials Object.
   */
  public async updateCredentialsRequest(
    loggedInUser: Credentials,
    updateCredentialsDto: UpdateCredentialsDto,
  ): Promise<{ token: string }> {
    if (updateCredentialsDto.email && updateCredentialsDto.password) {
      // Compare if the passwords match.
      const passwordMatch = await bcrypt.compare(
        updateCredentialsDto.password!,
        loggedInUser.password,
      );

      // If passwords don't match, throw an HTTP Exception.
      if (!passwordMatch) {
        throw new BadRequestException({
          message: AuthError.WRONG_PASSWORD,
        });
      }

      // Check if email address already is linked to another account.
      const emailCheck = await this.getCredential({
        emailAddress: updateCredentialsDto.email!,
      });

      // Throw an error if it already exists.
      if (emailCheck) {
        throw new BadRequestException({
          message: AuthError.ACCOUNT_ALREADY_EXISTS_FOR_EMAIL,
        });
      }

      // Update Credentials Object.
      await this.updateCredential({
        where: {
          id: loggedInUser.id,
        },
        data: {
          emailAddress: updateCredentialsDto.email!,
        },
      });

      // Update Firebase Email Address.
      await this.firebaseService.firebaseAuth.updateUser(
        loggedInUser.firebaseId,
        {
          email: updateCredentialsDto.email,
        },
      );

      // Return new authentication token.
      return await this.generateCustomToken({
        username: loggedInUser.username,
        password: updateCredentialsDto.password,
      });
    } else if (
      updateCredentialsDto.oldPassword &&
      updateCredentialsDto.newPassword
    ) {
      // Compare if the passwords match.
      const passwordMatch = await bcrypt.compare(
        updateCredentialsDto.oldPassword!,
        loggedInUser.password,
      );

      // If passwords don't match, throw an HTTP Exception.
      if (!passwordMatch) {
        throw new BadRequestException({
          message: AuthError.WRONG_PASSWORD,
        });
      }

      // Hashing the new password.
      const passwordHash = await bcrypt.hash(
        updateCredentialsDto.newPassword!,
        10,
      );

      // Update Credentials Object.
      await this.updateCredential({
        where: {
          id: loggedInUser.id,
        },
        data: {
          password: passwordHash,
        },
      });

      // Return new authentication token.
      return await this.generateCustomToken({
        username: loggedInUser.username,
        password: updateCredentialsDto.newPassword,
      });
    } else {
      throw new BadRequestException({
        message: CommonError.ILLEGAL_ACTION,
      });
    }
  }

  /**
   * Service Implementation for building deletion transaction array.
   * @param account Account Model.
   * @param credentials Credentials Model.
   * @returns Transactions Array.
   */
  private async buildTransaction(
    account: Account,
    credentials: Credentials,
  ): Promise<any[]> {
    const transactionArray = [];
    // Check for message record existence.
    if (
      (
        await this.prismaService.message.findMany({
          where: { sentBy: { id: account.id } },
        })
      ).length > 0
    ) {
      transactionArray.push(
        this.prismaService.message.deleteMany({
          where: {
            sentBy: {
              id: account.id,
            },
          },
        }),
      );
    }
    // Check for chat record existence.
    if (
      (
        await this.prismaService.chat.findMany({
          where: {
            participants: {
              some: {
                id: account.id,
              },
            },
          },
        })
      ).length > 0
    ) {
      transactionArray.push(
        this.prismaService.chat.deleteMany({
          where: {
            participants: {
              some: {
                id: account.id,
              },
            },
          },
        }),
      );
    }
    // Check for friend record existence.
    if (
      (
        await this.prismaService.friends.findMany({
          where: {
            accounts: {
              some: {
                id: account.id,
              },
            },
          },
        })
      ).length > 0
    ) {
      transactionArray.push(
        this.prismaService.friends.deleteMany({
          where: {
            accounts: {
              some: {
                id: account.id,
              },
            },
          },
        }),
      );
    }
    // Check for token record existence.
    if (
      await this.prismaService.token.findUnique({
        where: {
          credentialsId: credentials.id,
        },
      })
    ) {
      transactionArray.push(
        this.prismaService.token.delete({
          where: {
            credentialsId: credentials.id,
          },
        }),
      );
    }

    // Return transaction array.
    return transactionArray;
  }

  /**
   * Service Implementation for user account login through Firebase custom token generation.
   * @param loginAccountDto DTO Object for logging into account.
   * @returns Object containing auth token.
   */
  private async generateCustomToken(
    loginAccountDto: LoginAccountDto,
  ): Promise<{ token: string }> {
    // Fetch crednetials from the database.
    const credentials = await this.getCredential({
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
}
