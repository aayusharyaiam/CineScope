import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  projectId: "cinescope-aayush",
  appId: "1:1025143610823:web:78a74fc01b9423423d4de2",
  storageBucket: "cinescope-aayush.firebasestorage.app",
  apiKey: "AIzaSyD89EQH7rN1U9decx7l5bw41J_XW2McaBI",
  authDomain: "cinescope-aayush.firebaseapp.com",
  messagingSenderId: "1025143610823"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});
