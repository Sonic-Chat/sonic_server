import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { FirebaseService } from './../modules/firebase/firebase.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CredentialsService } from 'src/modules/credentials/credentials.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly credentialsService: CredentialsService,
  ) {}

  private async authenticateRequest(request): Promise<boolean> {
    try {
      if (
        request.headers.authorization &&
        request.headers.authorization.split(' ')[0] === 'Bearer'
      ) {
        const authToken = request.headers.authorization.split(' ')[1];

        const firebaseUser =
          await this.firebaseService.firebaseAuth.verifyIdToken(authToken);
        request.user = await this.credentialsService.getCredential({
          firebaseId: firebaseUser.uid,
        });
        return true;
      } else {
        throw new ForbiddenException({
          message: AuthError.UNAUTHENTICATED,
        });
      }
    } catch (error) {
      console.log(error);
      throw new ForbiddenException({
        message: AuthError.UNAUTHENTICATED,
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return await this.authenticateRequest(context.switchToHttp().getRequest());
  }
}
