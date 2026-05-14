// API Setup for CineScope
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';
const TMDB_CACHE_TTL = 15 * 60 * 1000;
const OMDB_CACHE_TTL = 24 * 60 * 60 * 1000;
const GEMINI_CACHE_TTL = 60 * 60 * 1000;

const responseCache = new Map();
const inFlightRequests = new Map();

const getCachedValue = (cacheKey, ttl) => {
  const entry = responseCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    responseCache.delete(cacheKey);
    return null;
  }
  return entry.value;
};

const setCachedValue = (cacheKey, value) => {
  responseCache.set(cacheKey, {
    timestamp: Date.now(),
    value
  });
  return value;
};

const withCache = async (cacheKey, ttl, fetcher) => {
  const cached = getCachedValue(cacheKey, ttl);
  if (cached !== null) return cached;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const request = Promise.resolve()
    .then(fetcher)
    .then(result => setCachedValue(cacheKey, result))
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);
  return request;
};

const fetchJson = async (url, { timeoutMs = 8000, cacheKey = '', ttl = 0, requestInit = {} } = {}) => {
  if (cacheKey && ttl > 0) {
    return withCache(cacheKey, ttl, async () => {
      const response = await fetchJson(url, { timeoutMs, requestInit });
      return response;
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...requestInit, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

// Proxy URLs to bypass ISP blocking of TMDB
const PROXY_URLS = [
  '', // try direct first
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
];

// Smart TMDB fetch — tries direct, then proxies
const tmdbFetch = async (path) => {
  const directUrl = `${TMDB_BASE_URL}${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  const cacheKey = `tmdb:${directUrl}`;

  return withCache(cacheKey, TMDB_CACHE_TTL, async () => {
    for (const proxy of PROXY_URLS) {
      try {
        const url = proxy ? `${proxy}${encodeURIComponent(directUrl)}` : directUrl;
        const data = await fetchJson(url, { timeoutMs: 3500 });
        if (proxy) console.log(`[TMDB] Fetched via proxy: ${proxy.substring(0, 30)}...`);
        return data;
      } catch (err) {
        console.warn(`[TMDB] ${proxy ? 'Proxy' : 'Direct'} failed for ${path}:`, err.message);
      }
    }
    throw new Error('All TMDB fetch attempts failed (direct + proxies)');
  });
};

const omdbFetchByQuery = async (params, ttl = OMDB_CACHE_TTL) => {
  const queryString = new URLSearchParams({
    ...params,
    apikey: OMDB_API_KEY
  }).toString();
  const url = `${OMDB_BASE_URL}/?${queryString}`;
  return fetchJson(url, { timeoutMs: 8000, cacheKey: `omdb:${queryString}`, ttl });
};

const omdbFetchByTitle = (title, year) => omdbFetchByQuery({ t: title, ...(year ? { y: year } : {}) });
const omdbFetchById = (imdbId) => omdbFetchByQuery({ i: imdbId });

// Helper function to fetch dynamic list from Gemini and details from OMDB
const fetchDynamicFallback = async (type) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${today}_${type}`;
  const docRef = doc(db, 'daily_fallbacks', cacheKey);
  
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(`[Cache Hit] Serving ${type} from Firebase Cache for ${today}`);
      return docSnap.data();
    }
  } catch (err) {
    console.error("Firebase Cache Read Error:", err);
  }

  console.log(`[Cache Miss] Generating new ${type} data for ${today} using Gemini...`);

  let prompt = "";
  if (type === 'movies') prompt = "List 10 currently trending popular movies. Return ONLY a valid JSON array of objects with 'title' and 'year' (as string).";
  if (type === 'shows') prompt = "List 10 currently trending popular TV shows. Return ONLY a valid JSON array of objects with 'title' and 'year' (as string).";
  if (type === 'actors') prompt = "List 12 currently popular Hollywood actors. Return ONLY a valid JSON array of objects with 'name'.";

  try {
    const data = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      timeoutMs: 10000,
      cacheKey: `gemini:fallback:${today}:${type}`,
      ttl: GEMINI_CACHE_TTL,
      requestInit: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    });
    const text = data.candidates[0].content.parts[0].text;
    const jsonStr = text.match(/\[.*\]/s);
    
    if (jsonStr) {
      const items = JSON.parse(jsonStr[0]);
      
      if (type === 'actors') {
        const fallbackImages = [
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=500',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500'
        ];
        const fallbackData = {
          results: items.map((item, index) => ({
            id: index + 1000,
            name: item.name,
            profile_path: null,
            fallbackImage: fallbackImages[index % fallbackImages.length]
          }))
        };
        try {
          await setDoc(docRef, fallbackData);
          console.log(`[Cache Saved] Saved new actors data to Firebase Cache for ${today}`);
        } catch (e) {
          console.error("Failed to save to cache", e);
        }
        return fallbackData;
      }

      // Fetch OMDB for movies/shows
      const omdbPromises = items.map(async (item) => {
        const omdbData = await omdbFetchByTitle(item.title, item.year);
        if (omdbData.Response === "True") {
          return {
            id: omdbData.imdbID,
            title: omdbData.Title,
            name: omdbData.Title,
            release_date: omdbData.Year,
            first_air_date: omdbData.Year,
            vote_average: omdbData.imdbRating && omdbData.imdbRating !== "N/A" ? parseFloat(omdbData.imdbRating) : 0,
            poster_path: null,
            fallbackImage: omdbData.Poster !== "N/A" ? omdbData.Poster : 'https://via.placeholder.com/500x750?text=No+Poster'
          };
        }
        return null;
      });
      
      const results = (await Promise.all(omdbPromises)).filter(Boolean);
      const finalData = { results };
      
      try {
        await setDoc(docRef, finalData);
        console.log(`[Cache Saved] Saved new ${type} data to Firebase Cache for ${today}`);
      } catch (err) {
        console.error("Firebase Cache Write Error:", err);
      }
      
      return finalData;
    }
  } catch (err) {
    console.error("Dynamic Fallback failed:", err);
  }
  return null;
};

export const tmdbApi = {
  // Get trending movies
  getTrending: async (timeWindow = 'day') => {
    try {
      return await tmdbFetch(`/trending/movie/${timeWindow}`);
    } catch (error) {
      console.error("TMDB API Error (getTrending):", error);
      const dynamicData = await fetchDynamicFallback('movies');
      if (dynamicData) return dynamicData;
      
      // Ultimate fallback if Gemini/OMDB also fail
      return {
        results: [
          { id: 550, title: 'Fight Club (Fallback)', release_date: '1999-10-15', vote_average: 8.4, poster_path: null, fallbackImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=500' }
        ]
      };
    }
  },
  
  // Get trending shows
  getTrendingShows: async (timeWindow = 'day') => {
    try {
      return await tmdbFetch(`/trending/tv/${timeWindow}`);
    } catch (error) {
      console.error("TMDB API Error (getTrendingShows):", error);
      const dynamicData = await fetchDynamicFallback('shows');
      if (dynamicData) return dynamicData;

      return {
        results: [
          { id: 1399, name: 'Game of Thrones (Fallback)', first_air_date: '2011-04-17', vote_average: 8.4, poster_path: null, fallbackImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=500' }
        ]
      };
    }
  },

  // Get popular actors
  getPopularActors: async () => {
    try {
      return await tmdbFetch('/person/popular');
    } catch (error) {
      console.error("TMDB API Error (getPopularActors):", error);
      const dynamicData = await fetchDynamicFallback('actors');
      if (dynamicData) return dynamicData;

      return {
        results: [
          { id: 112, name: 'Leonardo DiCaprio', profile_path: null, fallbackImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500' }
        ]
      };
    }
  },

  // Get new/airing today shows
  getNewShows: async () => {
    try {
      return await tmdbFetch('/tv/airing_today');
    } catch (error) {
      console.error("TMDB API Error (getNewShows):", error);
      const dynamicData = await fetchDynamicFallback('shows');
      if (dynamicData) return dynamicData;
      return { results: [] };
    }
  },

  // Get top-rated shows
  getTopRatedShows: async () => {
    try {
      return await tmdbFetch('/tv/top_rated');
    } catch (error) {
      console.error("TMDB API Error (getTopRatedShows):", error);
      const dynamicData = await fetchDynamicFallback('shows');
      if (dynamicData) return dynamicData;
      return { results: [] };
    }
  },

  // Get now playing movies
  getNowPlayingMovies: async () => {
    try {
      return await tmdbFetch('/movie/now_playing');
    } catch (error) {
      console.error("TMDB API Error (getNowPlayingMovies):", error);
      const dynamicData = await fetchDynamicFallback('movies');
      if (dynamicData) return dynamicData;
      return { results: [] };
    }
  },

  // Get top-rated movies
  getTopRatedMovies: async () => {
    try {
      return await tmdbFetch('/movie/top_rated');
    } catch (error) {
      console.error("TMDB API Error (getTopRatedMovies):", error);
      const dynamicData = await fetchDynamicFallback('movies');
      if (dynamicData) return dynamicData;
      return { results: [] };
    }
  },
  
  // Search movies
  searchMovies: async (query) => {
    try {
      return await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("TMDB API Error (searchMovies):", error);
      
      // Fallback to OMDB if TMDB is blocked
      try {
        const omdbData = await omdbFetchByQuery({ s: query });
        
        if (omdbData.Response === "True" && omdbData.Search) {
          console.log("Successfully fetched from OMDB fallback");
          const mappedResults = omdbData.Search.map(item => ({
            id: item.imdbID,
            title: item.Title,
            release_date: item.Year,
            vote_average: 0,
            poster_path: null,
            fallbackImage: item.Poster !== "N/A" ? item.Poster : null
          }));
          return { results: mappedResults };
        }
      } catch (omdbError) {
        console.error("OMDB Fallback Error:", omdbError);
      }

      // Final fallback if both APIs are blocked
      return {
        results: [
          { id: 27205, title: `Result for "${query}" (Final Fallback)`, release_date: '2010-07-15', vote_average: 8.3, poster_path: null, fallbackImage: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=500' }
        ]
      };
    }
  },

  // Search TV shows
  searchShows: async (query) => {
    try {
      return await tmdbFetch(`/search/tv?query=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("TMDB API Error (searchShows):", error);
      return { results: [] };
    }
  },

  // Search movies and shows together
  searchMulti: async (query) => {
    try {
      return await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("TMDB API Error (searchMulti):", error);
      const movieResults = await tmdbApi.searchMovies(query);
      return {
        results: (movieResults.results || []).map(item => ({ ...item, media_type: 'movie' }))
      };
    }
  },

  // Get movie details including cast, videos, and watch providers
  getMovieDetails: async (movieId) => {
    try {
      return await tmdbFetch(`/movie/${movieId}?append_to_response=credits,videos,watch/providers,similar`);
    } catch (error) {
      console.error("TMDB API Error (getMovieDetails):", error);
      return { title: 'Movie Info Unavailable', overview: 'Could not fetch data. Your ISP might be blocking TMDB.', vote_average: 0 };
    }
  },

  // Get person (actor/director) details
  getPersonDetails: async (personId) => {
    try {
      return await tmdbFetch(`/person/${personId}?append_to_response=movie_credits,tv_credits`);
    } catch (error) {
      console.error("TMDB API Error (getPersonDetails):", error);
      return null;
    }
  },

  // Get TV show details
  getShowDetails: async (showId) => {
    try {
      return await tmdbFetch(`/tv/${showId}?append_to_response=credits,videos,similar`);
    } catch (error) {
      console.error("TMDB API Error (getShowDetails):", error);
      return { name: 'Show Info Unavailable', overview: 'Could not fetch data.', vote_average: 0 };
    }
  },

  // Discover movies by genre
  discoverByGenre: async (genreId, page = 1) => {
    try {
      return await tmdbFetch(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`);
    } catch (error) {
      console.error("TMDB API Error (discoverByGenre):", error);
      return { results: [] };
    }
  }
};

// TMDB genre name → ID mapping
export const GENRE_MAP = {
  'Action': 28,
  'Adventure': 12,
  'Animation': 16,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Family': 10751,
  'Fantasy': 14,
  'History': 36,
  'Horror': 27,
  'Music': 10402,
  'Mystery': 9648,
  'Romance': 10749,
  'Sci-Fi': 878,
  'Thriller': 53,
  'War': 10752,
  'Western': 37,
};

export const omdbApi = {
  // Get IMDb and Rotten Tomatoes ratings using OMDB
  // OMDB requires IMDb ID, which we can get from TMDB movie details
  getRatings: async (imdbId) => {
    if (!imdbId) return null;
    return omdbFetchById(imdbId);
  }
};

const extractJson = (text, fallback) => {
  if (!text) return fallback;
  const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    console.error("Gemini JSON parse error:", error);
    return fallback;
  }
};

const geminiGenerate = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }

  const data = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    timeoutMs: 10000,
    cacheKey: `gemini:prompt:${prompt}`,
    ttl: GEMINI_CACHE_TTL,
    requestInit: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  });
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// Gemini API Recommendations
export const geminiApi = {
  getRecommendations: async (preferences) => {
    try {
      const text = await geminiGenerate(`Based on the following user preferences, recommend 5 movies. Respond ONLY with a valid JSON array of objects containing "title" and "reason". Preferences: ${preferences}`);
      return extractJson(text, []);
    } catch (error) {
      console.error("Gemini API Error:", error);
      return [];
    }
  },

  getPersonalizedRecommendations: async ({ favoriteTitles = [], favoriteGenres = [], watchHistory = [], recentRatings = [], contextTitle = '' }) => {
    try {
      const prompt = `
You are CineBrain, a movie and web series recommendation engine.
Recommend 10 movies or web series this user is likely to love.

Favorite movies/shows: ${favoriteTitles.join(', ') || 'Unknown'}
Favorite genres: ${favoriteGenres.join(', ') || 'Unknown'}
Watch history: ${watchHistory.join(', ') || 'None yet'}
Recently rated titles: ${recentRatings.join(', ') || 'None yet'}
${contextTitle ? `Current title context: ${contextTitle}` : ''}

Return ONLY a valid JSON array. Each item must have:
- "title": exact movie or TV show title
- "mediaType": "movie" or "tv"
- "reason": one concise personalized reason under 22 words
No markdown. No extra text.
`;
      const text = await geminiGenerate(prompt);
      const items = extractJson(text, []);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error("Gemini API Error:", error);
      return [];
    }
  }
};
