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
let authInstance: any = null;
let dbInstance: any = null;

// This check ensures that Firebase is only initialized in a browser environment
// where the Firebase scripts from index.html have loaded.
// It prevents the build from crashing in a Node.js environment on Vercel.
if (typeof window !== 'undefined' && typeof firebase !== 'undefined' && isFirebaseConfigured) {
  try {
    // Prevent re-initializing the app, which can happen in React's development mode.
    if (!firebase.apps.length) {
      const app = firebase.initializeApp(firebaseConfig);
      authInstance = app.auth();
      dbInstance = app.firestore();
    } else {
      const app = firebase.app(); // Get the default app if it already exists
      authInstance = app.auth();
      dbInstance = app.firestore();
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured. Please update firebaseConfig.ts with your project's credentials. The app will be in a non-functional state.");
}

export const auth = authInstance;
export const db = dbInstance;