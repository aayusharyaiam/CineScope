import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const BOOTSTRAP_MARKER = {
  isBootstrap: true,
  createdAt: 0,
  updatedAt: 0
};

async function ensureDoc(pathParts, data) {
  const ref = doc(db, ...pathParts);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return false;
    await setDoc(ref, data);
    return true;
  } catch (error) {
    console.error('Firestore bootstrap error:', error);
    return false;
  }
}

export async function bootstrapFirestore() {
  await Promise.all([
    ensureDoc(['daily_fallbacks', '_bootstrap'], BOOTSTRAP_MARKER),
    ensureDoc(['websiteReviews', '_bootstrap'], BOOTSTRAP_MARKER),
    ensureDoc(['supportRequests', '_bootstrap'], BOOTSTRAP_MARKER)
  ]);
}