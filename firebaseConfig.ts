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

const initializeFirebase = () => {
  // Return the existing instance if it has already been created.
  if (appInstance) {
    return appInstance;
  }

  // Check that we are in a browser environment and Firebase is available.
  if (typeof window !== 'undefined' && typeof firebase !== 'undefined' && isFirebaseConfigured) {
    try {
      // Use the existing app if already initialized, otherwise initialize a new one.
      appInstance = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      return appInstance;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return null;
    }
  } else if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured. Please update firebaseConfig.ts with your project's credentials. The app will be in a non-functional state.");
  }
  
  return null;
};

// Export a function to get the auth instance.
export const getAuth = () => {
  const app = initializeFirebase();
  return app ? app.auth() : null;
};

// Export a function to get the Firestore instance.
export const getFirestore = () => {
  const app = initializeFirebase();
  return app ? app.firestore() : null;
};
