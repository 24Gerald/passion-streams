import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let initialized = false;

export function getFirebaseAdmin() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    return null;
  }

  if (!initialized && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    initialized = true;
    console.log("Firebase Admin initialized");
  }

  return admin;
}

export default getFirebaseAdmin();
