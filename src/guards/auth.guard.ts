import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { FirebaseService } from './../modules/firebase/firebase.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CredentialsService } from 'src/modules/credentials/credentials.service';

/**
 * Guard Service Implementation for Firebase account authentication.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly credentialsService: CredentialsService,
  ) {}

  /**
   * Method Implementation for authenticating requests using Firebase.
   * @param request HTTP Request Object.
   * @returns boolean if the request is authenticated or not.
   */
  private async authenticateRequest(request: any): Promise<boolean> {
    // Check if authentication header is present and valid.
    if (
      request.headers.authorization &&
      request.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      // Extract token from the header.
      const authToken = request.headers.authorization.split(' ')[1];

      try {
        // Authenticate token using firebase.
        const firebaseUser =
          await this.firebaseService.firebaseAuth.verifyIdToken(authToken);

        // Set user header on the request object.
        request.user = await this.credentialsService.getCredential({
          firebaseId: firebaseUser.uid,
        });

        // Return true for authenticated.
        return true;
      } catch (error) {
        console.log(error);
        throw new ForbiddenException({
          message: AuthError.UNAUTHENTICATED,
        });
      }
    } else {
      throw new ForbiddenException({
        message: AuthError.UNAUTHENTICATED,
      });
    }
  }

  /**
   * Method Implementation for Authentication Guard.
   * @param context NestJS Execution Context.
   * @returns boolean if the request is valid or not.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return await this.authenticateRequest(context.switchToHttp().getRequest());
  }
}
