import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAllUserMedia } from './userMedia';
import { getUserProfile } from './userProfile';
import { GENRE_MAP, geminiApi, tmdbApi } from './api';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const posterUrl = (path) => (
  path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/500x750?text=No+Poster'
);

const titleOf = (item) => item.title || item.name || 'Untitled';

const toRecommendationCard = (item, reason, mediaType) => ({
  id: item.id,
  title: titleOf(item),
  year: (item.release_date || item.first_air_date || '').substring(0, 4) || 'N/A',
  rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
  imageUrl: item.poster_path ? posterUrl(item.poster_path) : item.fallbackImage || posterUrl(null),
  mediaType,
  reason
});

const searchRecommendation = async (recommendation) => {
  const mediaType = recommendation.mediaType === 'tv' ? 'tv' : 'movie';
  const search = mediaType === 'tv'
    ? await tmdbApi.searchShows(recommendation.title)
    : await tmdbApi.searchMovies(recommendation.title);
  const match = search.results?.find(item => item.poster_path) || search.results?.[0];

  if (!match) return null;
  return toRecommendationCard(match, recommendation.reason, mediaType);
};

const fallbackRecommendations = async (profile, mediaItems, limit = 10) => {
  const preferredGenres = profile?.preferences?.favoriteGenres || [];
  const genreId = GENRE_MAP[preferredGenres[0]] || null;
  const data = genreId
    ? await tmdbApi.discoverByGenre(genreId)
    : await tmdbApi.getTrending('week');

  return (data.results || []).slice(0, limit).map(item => toRecommendationCard(
    item,
    preferredGenres[0]
      ? `Matches your ${preferredGenres[0]} taste profile.`
      : mediaItems.length > 0
        ? 'A strong match for your recent CineScope activity.'
        : 'A popular pick to start shaping your taste profile.',
    'movie'
  ));
};

const buildTasteProfile = (profile, mediaItems, contextTitle = '') => {
  const preferences = profile?.preferences || {};
  const watched = mediaItems.filter(item => item.status === 'watched');
  const rated = mediaItems.filter(item => item.rating > 0);
  const favorites = mediaItems.filter(item => item.isFavorite);

  const favoriteTitles = [
    ...(preferences.favoriteTitles || []),
    ...favorites.map(item => item.title),
    ...rated.filter(item => item.rating >= 4).map(item => item.title)
  ].filter(Boolean);

  return {
    favoriteTitles: [...new Set(favoriteTitles)].slice(0, 15),
    favoriteGenres: preferences.favoriteGenres || [],
    watchHistory: watched.map(item => item.title).filter(Boolean).slice(0, 20),
    recentRatings: rated
      .sort((a, b) => (b.updatedAt || b.addedAt || 0) - (a.updatedAt || a.addedAt || 0))
      .map(item => `${item.title} (${item.rating}/5)`)
      .slice(0, 12),
    contextTitle
  };
};

export async function getUserRecommendations(uid, options = {}) {
  const { force = false, contextTitle = '', limit = 10 } = options;
  if (!uid) return [];

  const cacheKey = contextTitle ? `because_${contextTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}` : 'weekly';
  const cacheRef = doc(db, 'users', uid, 'recommendations', cacheKey);

  if (!force) {
    try {
      const snap = await getDoc(cacheRef);
      const cached = snap.exists() ? snap.data() : null;
      if (cached?.generatedAt && Date.now() - cached.generatedAt < WEEK_MS && cached.items?.length > 0) {
        return cached.items.slice(0, limit);
      }
    } catch (error) {
      console.error('AI recommendation cache read error:', error);
    }
  }

  const [profile, mediaItems] = await Promise.all([
    getUserProfile(uid),
    getAllUserMedia(uid)
  ]);

  const tasteProfile = buildTasteProfile(profile, mediaItems, contextTitle);
  const rawItems = await geminiApi.getPersonalizedRecommendations(tasteProfile);
  const enriched = (await Promise.all(rawItems.slice(0, limit + 4).map(searchRecommendation))).filter(Boolean);
  const items = enriched.length > 0 ? enriched.slice(0, limit) : await fallbackRecommendations(profile, mediaItems, limit);

  try {
    await setDoc(cacheRef, {
      generatedAt: Date.now(),
      contextTitle,
      items
    }, { merge: true });
  } catch (error) {
    console.error('AI recommendation cache write error:', error);
  }

  return items;
}
