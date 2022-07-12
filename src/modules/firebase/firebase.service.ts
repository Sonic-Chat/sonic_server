import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  public firebaseAuth: admin.auth.Auth;
  public firebaseFirestore: admin.firestore.Firestore;
  public firebaseMessaging: admin.messaging.Messaging;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const firebaseJson = JSON.parse(
      process.env.NODE_ENV === 'production'
        ? process.env.FIREBASE_JSON
        : this.configService.get<string>('FIREBASE_JSON'),
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseJson),
      });
      this.logger.log('Firebase Admin is configured and ready to go');
    }

    this.firebaseAuth = admin.auth();
    this.firebaseMessaging = admin.messaging();
    this.firebaseFirestore = admin.firestore();

    this.logger.log('Firebase Admin Services has been setup');
  }
}
