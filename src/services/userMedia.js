import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firestore user media service.
 * Collection: users/{uid}/media/{mediaType}_{mediaId}
 * Document shape: { mediaType, mediaId, title, posterUrl, status, rating, addedAt, updatedAt }
 */

const mediaDocRef = (uid, mediaType, mediaId) =>
  doc(db, 'users', uid, 'media', `${mediaType}_${mediaId}`);

export async function getUserMediaEntry(uid, mediaType, mediaId) {
  try {
    const snap = await getDoc(mediaDocRef(uid, mediaType, mediaId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('getUserMediaEntry error:', e);
    return null;
  }
}

/**
 * status: 'watchlist' | 'watched'
 */
export async function setUserMediaEntry(uid, mediaType, mediaId, data) {
  try {
    await setDoc(mediaDocRef(uid, mediaType, mediaId), {
      mediaType,
      mediaId,
      ...data,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('setUserMediaEntry error:', e);
    return false;
  }
}

export async function removeUserMediaEntry(uid, mediaType, mediaId) {
  try {
    await deleteDoc(mediaDocRef(uid, mediaType, mediaId));
    return true;
  } catch (e) {
    console.error('removeUserMediaEntry error:', e);
    return false;
  }
}

/**
 * Get all media entries for a user.
 * Returns array of { mediaType, mediaId, title, posterUrl, status, rating, addedAt, updatedAt }
 */
export async function getAllUserMedia(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'media');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getAllUserMedia error:', e);
    return [];
  }
}
