import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseConfig } from "@/firebase/env/firebase.credential";

export const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
      });
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

export function signInWithGoogle(): ReturnType<typeof signInWithPopup> {
  return signInWithPopup(auth, googleAuthProvider);
}
