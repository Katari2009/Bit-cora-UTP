import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLydWJakov1ZhBD7Wpv1UGr8ypH96mbrE",
  authDomain: "bitacorautp.firebaseapp.com",
  projectId: "bitacorautp",
  storageBucket: "bitacorautp.firebasestorage.app",
  messagingSenderId: "132822824325",
  appId: "1:132822824325:web:c0927c6639b5558bbe80ec",
  measurementId: "G-1TT63KXH5S"
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let appInstance: firebase.app.App | null = null;

const initializeFirebase = (): firebase.app.App | null => {
  if (appInstance) return appInstance;

  if (isFirebaseConfigured) {
    try {
      appInstance = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      return appInstance;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return null;
    }
  } 
  
  if (!isFirebaseConfigured) {
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
  if (!isFirebaseConfigured) return null;
  // Initialize to make sure firebase is available
  initializeFirebase();
  return new firebase.auth.GoogleAuthProvider();
};

export { firebase };
