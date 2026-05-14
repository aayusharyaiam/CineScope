import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const defaultPreferences = {
  favoriteMovies: [],
  favoriteTitles: [],
  favoriteGenres: [],
  favoriteActors: [],
  favoriteDirectors: []
};

export async function getUserProfile(uid) {
  if (!uid) return null;

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
}

export async function ensureUserProfile(user) {
  if (!user) return null;

  const profile = {
    displayName: user.displayName || '',
    email: user.email || '',
    emailVerified: Boolean(user.emailVerified),
    photoURL: user.photoURL || '',
    createdAt: Date.now(),
    onboardingComplete: false,
    preferences: defaultPreferences
  };

  try {
    const existing = await getUserProfile(user.uid);
    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      ...(existing || {}),
      displayName: user.displayName || existing?.displayName || '',
      email: user.email || existing?.email || '',
      emailVerified: Boolean(user.emailVerified),
      photoURL: user.photoURL || existing?.photoURL || ''
    }, { merge: true });
    return existing || profile;
  } catch (error) {
    console.error('ensureUserProfile error:', error);
    return profile;
  }
}

export async function saveUserPreferences(uid, preferences) {
  if (!uid) return false;

  try {
    await setDoc(doc(db, 'users', uid), {
      onboardingComplete: true,
      preferences: {
        ...defaultPreferences,
        ...preferences
      },
      preferencesUpdatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('saveUserPreferences error:', error);
    return false;
  }
}

export async function recordFirstFeedbackPrompt(uid) {
  if (!uid) return false;

  try {
    const profile = await getUserProfile(uid);
    if (profile?.firstFeedbackPromptedAt) return false;

    await setDoc(doc(db, 'users', uid), {
      firstFeedbackPromptedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('recordFirstFeedbackPrompt error:', error);
    return false;
  }
}
