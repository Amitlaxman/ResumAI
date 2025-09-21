import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your own Firebase project's configuration.
const firebaseConfig = {
  apiKey: "AIzaSyDiJTADvgvymL4ETYuBd5eCNrh2vuCULZ4",
  authDomain: "studio-2310203864-786ac.firebaseapp.com",
  projectId: "studio-2310203864-786ac",
  storageBucket: "studio-2310203864-786ac.appspot.com",
  messagingSenderId: "862450543860",
  appId: "1:862450543860:web:6c6ed8ec6feb7f3b7982a1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
