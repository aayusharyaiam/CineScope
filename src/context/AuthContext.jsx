import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  reload,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { ensureUserProfile } from '../services/userProfile';
import { bootstrapFirestore } from '../services/firestoreBootstrap';

const AuthContext = createContext();

// Shared hook lives here with the provider so auth consumers keep one import path.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRevision, setAuthRevision] = useState(0);

  // Fire-and-forget helper — syncs the Firestore profile in the background.
  // Auth state should NEVER wait on this; a slow or offline Firestore must not
  // block navigation or render.
  function syncProfileInBackground(user) {
    if (!user) return;
    ensureUserProfile(user).catch(err =>
      console.error('Background profile sync failed:', err)
    );
  }

  // Sign up with Email and Password
  async function signup(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    await sendEmailVerification(userCredential.user);
    // Profile sync can happen in background — don't block the signup flow
    syncProfileInBackground(userCredential.user);
    setCurrentUser(userCredential.user);
    return userCredential;
  }

  // Log in with Email and Password
  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(credential.user);
    syncProfileInBackground(credential.user);
    return credential;
  }

  // Log out
  function logout() {
    return signOut(auth);
  }

  // Google Sign-In
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    // Set user state immediately so ProtectedRoute works right away.
    // Profile sync happens in background — never blocks navigation.
    setCurrentUser(credential.user);
    syncProfileInBackground(credential.user);
    return credential;
  }

  async function sendVerificationEmail() {
    if (!auth.currentUser) return false;

    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error) {
      console.error('sendVerificationEmail error:', error);
      return false;
    }
  }

  async function refreshCurrentUser() {
    if (!auth.currentUser) return null;

    try {
      await reload(auth.currentUser);
      setCurrentUser(auth.currentUser);
      setAuthRevision(revision => revision + 1);
      syncProfileInBackground(auth.currentUser);
      return auth.currentUser;
    } catch (error) {
      console.error('refreshCurrentUser error:', error);
      return auth.currentUser;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Set auth state IMMEDIATELY — never block on Firestore.
      setCurrentUser(user);
      setLoading(false);
      syncProfileInBackground(user);
      bootstrapFirestore().catch(err =>
        console.error('Firestore bootstrap failed:', err)
      );
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    authRevision,
    login,
    signup,
    logout,
    loginWithGoogle,
    sendVerificationEmail,
    refreshCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
