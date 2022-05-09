import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  public firebaseAuth: admin.auth.Auth;
  public firebaseFirestore: admin.firestore.Firestore;
  public firebaseMessaging: admin.messaging.Messaging;

  onModuleInit() {
    const firebaseJson = JSON.parse(process.env.FIREBASE_JSON);

    if (!admin.apps.length) {
      admin.initializeApp(firebaseJson);
      this.logger.log('Firebase Admin is configured and ready to go');
    }

    this.firebaseAuth = admin.auth();
    this.firebaseMessaging = admin.messaging();
    this.firebaseFirestore = admin.firestore();

    this.logger.log('Firebase Admin Services has been setup');
  }
}
