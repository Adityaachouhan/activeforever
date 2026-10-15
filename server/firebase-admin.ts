import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth, type DecodedIdToken } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let adminApp: App;
let adminAuth: Auth;

/**
 * Initializes Firebase Admin SDK.
 * 
 * Credentials can be supplied in two ways:
 * 1. By setting FIREBASE_SERVICE_ACCOUNT_KEY in .env (either relative/absolute path to JSON file or raw JSON string).
 * 2. Or by setting FIREBASE_PROJECT_ID in .env (defaults to 'activeforeverindia-87d4f').
 */
export function getFirebaseAdmin(): { app: App; auth: Auth } {
  if (getApps().length > 0) {
    const app = getApps()[0];
    return { app, auth: getAuth(app) };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'activeforeverindia-87d4f';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // 1. Direct environment variables (Best for .env configurations)
  if (clientEmail && privateKey) {
    try {
      // Normalize escaped newlines if passed as single-line string in .env
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        }),
        projectId,
      });
      adminAuth = getAuth(adminApp);
      console.log('[Firebase Admin] Initialized with Client Email & Private Key for project:', projectId);
      return { app: adminApp, auth: adminAuth };
    } catch (err) {
      console.error('[Firebase Admin] Error initializing with client email & private key:', err);
    }
  }

  // 2. Service Account Key file or JSON string
  if (serviceAccountKey) {
    try {
      let credentials: any;
      if (serviceAccountKey.trim().startsWith('{')) {
        credentials = JSON.parse(serviceAccountKey);
      } else {
        const resolvedPath = path.isAbsolute(serviceAccountKey)
          ? serviceAccountKey
          : path.resolve(process.cwd(), serviceAccountKey);

        if (fs.existsSync(resolvedPath)) {
          credentials = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        } else {
          console.warn(`[Firebase Admin] Service account file not found at: ${resolvedPath}. Falling back to projectId.`);
        }
      }

      if (credentials) {
        adminApp = initializeApp({
          credential: cert(credentials),
          projectId: credentials.project_id || projectId,
        });
        adminAuth = getAuth(adminApp);
        console.log('[Firebase Admin] Initialized with Service Account credentials for project:', credentials.project_id || projectId);
        return { app: adminApp, auth: adminAuth };
      }
    } catch (err) {
      console.error('[Firebase Admin] Error loading service account credentials, falling back to projectId:', err);
    }
  }

  // Fallback: Initialize with Project ID
  adminApp = initializeApp({
    projectId,
  });
  adminAuth = getAuth(adminApp);
  console.log(`[Firebase Admin] Initialized with projectId: ${projectId}`);
  return { app: adminApp, auth: adminAuth };
}

// Initialize on module load
const initialized = getFirebaseAdmin();
adminApp = initialized.app;
adminAuth = initialized.auth;

export { adminApp, adminAuth };

/**
 * Verifies a client-provided Firebase ID token.
 * Returns the decoded token payload including phone_number and uid.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  if (!idToken) {
    throw new Error('ID Token is required for verification.');
  }
  return await adminAuth.verifyIdToken(idToken);
}
