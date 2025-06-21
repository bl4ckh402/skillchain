// lib/firebase-admin.ts
import * as admin from "firebase-admin";

// Use a global variable to prevent re-initialization in hot-reload/dev
const globalForAdmin = global as unknown as { adminApp?: admin.app.App };

if (!globalForAdmin.adminApp) {
  // Prefer service account JSON if available, else use env vars
  const serviceAccount =
    process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT !== ""
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;

  globalForAdmin.adminApp = admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const adminApp = globalForAdmin.adminApp;
export const db = adminApp.firestore();
export const adminAuth = adminApp.auth();
export const auth = adminAuth; // Add alias for backward compatibility
export const adminStorage = adminApp.storage();
export { admin };