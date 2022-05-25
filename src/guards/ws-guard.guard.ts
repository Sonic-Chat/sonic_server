import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsArgumentsHost } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { CredentialsService } from 'src/modules/credentials/credentials.service';
import { FirebaseService } from 'src/modules/firebase/firebase.service';
import { WebSocket as Socket } from 'ws';

/**
 * WS Guard Service Implementation for Firebase account authentication.
 */
@Injectable()
export class WSGuardGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly credentialsService: CredentialsService,
  ) {}

  /**
   * Method Implementation for authenticating WS requests using Firebase.
   * @param wsArgumentsHost Websockets Arguments Host.
   * @returns boolean if the request is authenticated or not.
   */
  private async authenticateWSRequest(
    wsArgumentsHost: WsArgumentsHost,
  ): Promise<boolean> {
    const client = wsArgumentsHost.getClient<Socket>();
    const data = wsArgumentsHost.getData();
    // Check if authentication header is present and valid.
    if (data.authorization) {
      // Extract token from the header.
      const authToken = data.authorization;

      try {
        // Authenticate token using firebase.
        const firebaseUser =
          await this.firebaseService.firebaseAuth.verifyIdToken(authToken);

        // Fetch user from database.
        const serverUser = await this.credentialsService.getCredential({
          firebaseId: firebaseUser.uid,
        });

        // Check if user exists, else send an exception.
        if (!serverUser) {
          client.send({
            type: 'error',
            message: AuthError.UNAUTHENTICATED,
          });
        }

        // Return true for authenticated.
        return true;
      } catch (error) {
        console.log(error);
        client.send({
          type: 'error',
          message: AuthError.UNAUTHENTICATED,
        });
      }
    } else {
      client.send({
        type: 'error',
        message: AuthError.UNAUTHENTICATED,
      });
    }
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    return await this.authenticateWSRequest(context.switchToWs());
  }
}
