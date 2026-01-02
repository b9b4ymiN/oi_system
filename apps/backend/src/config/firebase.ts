import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let db: admin.database.Database;

export function initializeFirebase(): admin.database.Database {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase/service-account.json';
  const databaseURL = process.env.FIREBASE_DB_URL;

  if (!databaseURL) {
    throw new Error('FIREBASE_DB_URL environment variable is not set');
  }

  try {
    const serviceAccount = JSON.parse(
      readFileSync(resolve(serviceAccountPath), 'utf-8')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL
    });

    db = admin.database();
    console.log(`✅ Firebase connected to: ${databaseURL}`);
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

export function getDatabase(): admin.database.Database {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

export const firebaseConfig = {
  databaseURL: process.env.FIREBASE_DB_URL || '',
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase/service-account.json'
};
