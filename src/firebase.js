import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD89EQH7rN1U9decx7l5bw41J_XW2McaBI",
  authDomain: "cinescope-aayush.firebaseapp.com",
  projectId: "cinescope-aayush",
  storageBucket: "cinescope-aayush.firebasestorage.app",
  messagingSenderId: "1025143610823",
  appId: "1:1025143610823:web:78a74fc01b9423423d4de2",
  measurementId: "G-5ZVL9GQKLG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
