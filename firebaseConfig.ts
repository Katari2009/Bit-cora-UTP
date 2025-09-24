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
let authInstance: firebase.auth.Auth | null = null;
let firestoreInstance: firebase.firestore.Firestore | null = null;
let googleAuthProviderInstance: firebase.auth.GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
    authInstance = appInstance.auth();
    firestoreInstance = appInstance.firestore();
    googleAuthProviderInstance = new firebase.auth.GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Firebase is not configured. Please update firebaseConfig.ts with your project's credentials.");
  }
}

// Getter for the Auth service
export const getAuth = () => authInstance;

// Getter for the Firestore service
export const getFirestore = () => firestoreInstance;

// Getter for the Google Auth Provider instance
export const getGoogleAuthProvider = () => googleAuthProviderInstance;

export { firebase };
