import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const cleanText = (value, maxLength = 1200) => (
  String(value || '').trim().slice(0, maxLength)
);

export async function getWebsiteReview(uid) {
  if (!uid) return null;

  try {
    const snap = await getDoc(doc(db, 'websiteReviews', uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('getWebsiteReview error:', error);
    return null;
  }
}

export async function saveWebsiteReview(user, { rating, review, trigger = 'manual' }) {
  if (!user || !rating) return false;

  const now = Date.now();
  const existing = await getWebsiteReview(user.uid);
  const payload = {
    uid: user.uid,
    rating: Number(rating),
    review: cleanText(review),
    trigger,
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  try {
    await setDoc(doc(db, 'websiteReviews', user.uid), payload, { merge: true });
    await setDoc(doc(db, 'users', user.uid), {
      siteReviewSubmittedAt: now,
      websiteReview: {
        rating: payload.rating,
        review: payload.review,
        updatedAt: now
      }
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('saveWebsiteReview error:', error);
    return false;
  }
}

export async function getRecentWebsiteReviews(count = 6) {
  try {
    const snapshot = await getDocs(query(
      collection(db, 'websiteReviews'),
      orderBy('updatedAt', 'desc'),
      limit(count)
    ));
    return snapshot.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .filter(item => !item.isBootstrap);
  } catch (error) {
    console.error('getRecentWebsiteReviews error:', error);
    return [];
  }
}

export async function createSupportRequest(user, { topic, message }) {
  const now = Date.now();
  const id = `${user?.uid || 'guest'}_${now}`;

  try {
    await setDoc(doc(db, 'supportRequests', id), {
      uid: user?.uid || null,
      email: user?.email || '',
      displayName: user?.displayName || '',
      topic: cleanText(topic, 100),
      message: cleanText(message, 2000),
      status: 'new',
      createdAt: now,
      updatedAt: now
    });
    return true;
  } catch (error) {
    console.error('createSupportRequest error:', error);
    return false;
  }
}
