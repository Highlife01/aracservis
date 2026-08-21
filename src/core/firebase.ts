import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPUPtTFpcYhTGk85Y8XtK-ZBLFNWqxSwk",
  authDomain: "finansarena-bdae9.firebaseapp.com",
  projectId: "finansarena-bdae9",
  storageBucket: "finansarena-bdae9.firebasestorage.app",
  messagingSenderId: "894423807184",
  appId: "1:894423807184:web:0c3ab995a1b6177f4c9ad5",
  measurementId: "G-FN4CX0Y3JB"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const SUPER_ADMIN_EMAILS = [
  'cebrailkara@gmail.com'
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
