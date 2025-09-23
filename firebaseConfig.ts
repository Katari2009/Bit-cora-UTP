// IMPORTANT: Replace the placeholder values below with your own Firebase project's configuration.
// You can find this in your Firebase project settings.
// Go to Project settings > General tab > Your apps > Web app > Firebase SDK snippet > Config.
const firebaseConfig = {
  apiKey: "AIzaSyDLydWJakov1ZhBD7Wpv1UGr8ypH96mbrE",
  authDomain: "bitacorautp.firebaseapp.com",
  projectId: "bitacorautp",
  storageBucket: "bitacorautp.firebasestorage.app",
  messagingSenderId: "132822824325",
  appId: "1:132822824325:web:c0927c6639b5558bbe80ec",
  measurementId: "G-1TT63KXH5S"
};

// Check if the configuration is still the placeholder
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

declare const firebase: any;
let appInstance: any = null;

// Helper to safely get the firebase global object only in the browser
const getFirebaseGlobal = () => {
  if (typeof window !== 'undefined' && typeof firebase !== 'undefined') {
    return firebase;
  }
  return null;
}

const initializeFirebase = () => {
  if (appInstance) return appInstance;

  const fb = getFirebaseGlobal();
  if (fb && isFirebaseConfigured) {
    try {
      appInstance = fb.apps.length ? fb.app() : fb.initializeApp(firebaseConfig);
      return appInstance;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return null;
    }
  } else if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured. Please update firebaseConfig.ts with your project's credentials.");
  }
  return null;
};

// Getter for the Auth service
export const getAuth = () => {
  const app = initializeFirebase();
  return app ? app.auth() : null;
};

// Getter for the Firestore service
export const getFirestore = () => {
  const app = initializeFirebase();
  return app ? app.firestore() : null;
};

// Getter for a new Google Auth Provider instance
export const getGoogleAuthProvider = () => {
  const fb = getFirebaseGlobal();
  return fb ? new fb.auth.GoogleAuthProvider() : null;
}

// Getter for Auth Persistence types
export const getAuthPersistence = () => {
  const fb = getFirebaseGlobal();
  return fb ? fb.auth.Auth.Persistence : null;
}