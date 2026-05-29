// API Setup for CineScope
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Generic NVIDIA NIM Completion Helper (using the provided minimaxai/minimax-m2.7 model)
const queryNvidiaAI = async (prompt, systemPrompt = "") => {
  const directUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
  const payload = {
    model: "minimaxai/minimax-m2.7",
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1024
  };

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Build standard attempts.
  const attempts = [];
  if (isLocal) {
    // Local dev: Vite proxy handles it server-to-server, no CORS issues
    attempts.push('/nvidia-api/v1/chat/completions');
  } else {
    // Production (Vercel): use the serverless API proxy
    attempts.push('/api/nvidia');
  }
  
  // Public proxies as fallback
  attempts.push(`https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`);
  attempts.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`);

  for (const url of attempts) {
    try {
      console.log(`[NVIDIA NIM] Attempting query via: ${url}`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${NVIDIA_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn(`NVIDIA endpoint ${url} returned status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`NVIDIA request attempt failed for ${url}:`, err.message);
      continue;
    }
  }

  throw new Error("All NVIDIA NIM API request attempts failed.");
};


// Smart TMDB fetch — tries direct, Vercel proxy, then public CORS proxies
const tmdbFetch = async (path) => {
  const directUrl = `${TMDB_BASE_URL}${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const attempts = [];
  
  // 1) Direct (works if TMDB isn't ISP-blocked)
  attempts.push({ type: 'direct', url: directUrl });

  // 2) Vercel serverless proxy (bypasses ISP blocks entirely — server-to-server)
  if (!isLocal) {
    attempts.push({ type: 'proxy', url: `/api/tmdb?path=${encodeURIComponent(path)}` });
  }

  // 3) Public CORS proxies (last resort)
  attempts.push({ type: 'cors', url: `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}` });
  attempts.push({ type: 'cors', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}` });

  for (const { type, url } of attempts) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (type !== 'direct') console.log(`[TMDB] Fetched via ${type}`);
      return data;
    } catch (err) {
      console.warn(`[TMDB] ${type} failed for ${path}:`, err.message);
      continue;
    }
  }
  throw new Error('All TMDB fetch attempts failed (direct + proxy + CORS proxies)');
};

// Hardcoded premium fallback lists when both TMDB and Gemini APIs are rate-limited or blocked
const FALLBACK_MOVIES = [
  { title: "Inception", year: "2010" },
  { title: "The Dark Knight", year: "2008" },
  { title: "Interstellar", year: "2014" },
  { title: "Parasite", year: "2019" },
  { title: "Spider-Man: Into the Spider-Verse", year: "2018" },
  { title: "Whiplash", year: "2014" },
  { title: "Pulp Fiction", year: "1994" },
  { title: "The Matrix", year: "1999" },
  { title: "Spirited Away", year: "2001" },
  { title: "Gladiator", year: "2000" }
];

const FALLBACK_SHOWS = [
  { title: "Breaking Bad", year: "2008" },
  { title: "Stranger Things", year: "2016" },
  { title: "Game of Thrones", year: "2011" },
  { title: "Severance", year: "2022" },
  { title: "Succession", year: "2018" },
  { title: "The Last of Us", year: "2023" },
  { title: "Ted Lasso", year: "2020" },
  { title: "Sherlock", year: "2010" },
  { title: "The Mandalorian", year: "2019" },
  { title: "Arcane", year: "2021" }
];

const FALLBACK_ACTORS = [
  { name: "Leonardo DiCaprio" },
  { name: "Scarlett Johansson" },
  { name: "Cillian Murphy" },
  { name: "Margot Robbie" },
  { name: "Robert Downey Jr." },
  { name: "Florence Pugh" },
  { name: "Pedro Pascal" },
  { name: "Zendaya" },
  { name: "Keanu Reeves" },
  { name: "Timothée Chalamet" },
  { name: "Emma Stone" },
  { name: "Tom Hanks" }
];

// High-quality hardcoded fallback picks for Pick of the Day if Gemini fails
const FALLBACK_PICKS = [
  {
    title: "Inception",
    year: "2010",
    type: "movie",
    tagline: "Your mind is the scene of the crime.",
    whyWatch: "A mind-bending masterpiece from Christopher Nolan. With a stellar ensemble cast, incredible visual effects, and Hans Zimmer's legendary score, it's the perfect mix of high-concept science fiction and intense thriller action."
  },
  {
    title: "Interstellar",
    year: "2014",
    type: "movie",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    whyWatch: "An emotional and spectacular space odyssey. Nolan beautifully combines cutting-edge theoretical physics with a deep, heart-wrenching story of a father's promise to return to his daughter."
  },
  {
    title: "Breaking Bad",
    year: "2008",
    type: "series",
    tagline: "Change the equation.",
    whyWatch: "Widely regarded as one of the greatest television shows in history. Bryan Cranston and Aaron Paul deliver career-defining performances in this story of transformation, morality, and consequences."
  },
  {
    title: "Parasite",
    year: "2019",
    type: "movie",
    tagline: "Act like you own the place.",
    whyWatch: "This history-making Oscar Best Picture winner is a masterclass in tone-shifting. Part dark comedy, part thriller, and part social commentary, Bong Joon Ho's direction will keep you glued to the screen."
  },
  {
    title: "Severance",
    year: "2022",
    type: "series",
    tagline: "Please enjoy all each equally.",
    whyWatch: "A brilliant, sterile sci-fi thriller that satirizes corporate work culture. Its slow-burn mystery, spectacular cinematography, and outstanding ensemble cast create one of the most compelling watches of recent years."
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    year: "2018",
    type: "movie",
    tagline: "Anyone can wear the mask.",
    whyWatch: "A visual triumph that revolutionized modern animation. It brings the comic book pages to life with incredible artistry, infinite heart, and one of the finest soundtracks in superhero movie history."
  }
];

// Helper function to fetch dynamic list from NVIDIA NIM and details from OMDB
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

  console.log(`[Cache Miss] Generating new ${type} data for ${today} using NVIDIA NIM...`);

  let prompt = "";
  if (type === 'movies') prompt = "List 10 currently trending popular movies. Return ONLY a valid JSON array of objects with 'title' and 'year' (as string).";
  if (type === 'shows') prompt = "List 10 currently trending popular TV shows. Return ONLY a valid JSON array of objects with 'title' and 'year' (as string).";
  if (type === 'actors') prompt = "List 12 currently popular Hollywood actors. Return ONLY a valid JSON array of objects with 'name'.";

  let items = null;

  try {
    const text = await queryNvidiaAI(prompt, "You are a helpful assistant that strictly returns valid JSON arrays without any extra markdown or conversational text.");
    const jsonStr = text.match(/\[.*\]/s);
    if (jsonStr) {
      items = JSON.parse(jsonStr[0]);
    } else {
      throw new Error("Could not parse JSON array from NVIDIA response");
    }
  } catch (err) {
    console.warn(`[Fallback] NVIDIA ${type} generation failed, using premium local fallback:`, err.message);
    if (type === 'movies') items = FALLBACK_MOVIES;
    else if (type === 'shows') items = FALLBACK_SHOWS;
    else items = FALLBACK_ACTORS;
  }

  if (items) {
    try {
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
        try {
          const omdbRes = await fetch(`${OMDB_BASE_URL}/?t=${encodeURIComponent(item.title)}&y=${item.year}&apikey=${OMDB_API_KEY}`);
          const omdbData = await omdbRes.json();
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
        } catch (omdbErr) {
          console.warn(`OMDB fetch failed for ${item.title}:`, omdbErr.message);
        }
        
        // Return local item fallback if OMDB fetch fails
        return {
          id: Math.floor(Math.random() * 10000) + 2000,
          title: item.title,
          name: item.title,
          release_date: item.year,
          first_air_date: item.year,
          vote_average: 8.0,
          poster_path: null,
          fallbackImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=500'
        };
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
    } catch (err) {
      console.error("Failed to construct dynamic fallback results:", err);
    }
  }
  return null;
};

// Pick of the Day — NVIDIA NIM picks a random movie/series, details from OMDB, cached daily
export const getPickOfTheDay = async () => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${today}_pick_of_day`;
  const docRef = doc(db, 'daily_fallbacks', cacheKey);

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(`[Cache Hit] Pick of the Day from Firebase for ${today}`);
      return docSnap.data();
    }
  } catch (err) {
    console.error("Firebase Cache Read Error (pick):", err);
  }

  console.log(`[Cache Miss] Generating Pick of the Day for ${today}...`);

  let pick = null;
  let isFallback = false;

  try {
    const prompt = `Pick one random highly-rated movie OR web-series that you think people should watch today. Be creative and surprising — don't always pick the same obvious ones. Return ONLY a valid JSON object (not an array) with these fields: "title" (string), "year" (string), "type" (either "movie" or "series"), "tagline" (a short catchy 1-line tagline), "whyWatch" (2-3 sentences on why someone should watch it today).`;
    const text = await queryNvidiaAI(prompt, "You are a helpful assistant that strictly returns valid JSON objects without any extra markdown or conversational text.");
    const jsonStr = text.match(/\{.*\}/s);
    if (jsonStr) {
      pick = JSON.parse(jsonStr[0]);
    } else {
      throw new Error("Could not parse JSON object from NVIDIA response");
    }
  } catch (err) {
    console.warn("NVIDIA Pick of the Day generation failed, using premium local fallback:", err.message);
    const fallbackIndex = new Date().getDate() % FALLBACK_PICKS.length;
    pick = FALLBACK_PICKS[fallbackIndex];
    isFallback = true;
  }

  if (pick) {
    try {
      // Fetch details from OMDB
      const omdbRes = await fetch(`${OMDB_BASE_URL}/?t=${encodeURIComponent(pick.title)}&y=${pick.year}&apikey=${OMDB_API_KEY}`);
      const omdbData = await omdbRes.json();

      const pickData = {
        title: omdbData.Response === "True" ? omdbData.Title : pick.title,
        year: omdbData.Response === "True" ? omdbData.Year : pick.year,
        type: pick.type,
        tagline: pick.tagline,
        whyWatch: pick.whyWatch,
        poster: omdbData.Response === "True" && omdbData.Poster !== "N/A" ? omdbData.Poster : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
        rating: omdbData.Response === "True" && omdbData.imdbRating !== "N/A" ? omdbData.imdbRating : 'N/A',
        genre: omdbData.Response === "True" ? omdbData.Genre : 'Unknown',
        runtime: omdbData.Response === "True" ? omdbData.Runtime : 'N/A',
        plot: omdbData.Response === "True" ? omdbData.Plot : pick.whyWatch,
        director: omdbData.Response === "True" ? omdbData.Director : 'N/A',
        imdbID: omdbData.Response === "True" ? omdbData.imdbID : null,
        isFallback: isFallback
      };

      try {
        await setDoc(docRef, pickData);
        console.log(`[Cache Saved] Pick of the Day saved for ${today}`);
      } catch (e) {
        console.error("Failed to save pick to cache", e);
      }

      return pickData;
    } catch (omdbErr) {
      console.warn("Failed to fetch OMDB details for pick, serving basic details:", omdbErr.message);
      // Return a basic hydrated object using the data we have, preventing blank screen
      return {
        title: pick.title,
        year: pick.year,
        type: pick.type,
        tagline: pick.tagline,
        whyWatch: pick.whyWatch,
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
        rating: 'N/A',
        genre: 'Unknown',
        runtime: 'N/A',
        plot: pick.whyWatch,
        director: 'N/A',
        imdbID: null,
        isFallback: true
      };
    }
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
        const omdbRes = await fetch(`${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        const omdbData = await omdbRes.json();
        
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

  // Search actors/people across TMDB dynamically
  searchActors: async (query) => {
    try {
      return await tmdbFetch(`/search/person?query=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("TMDB API Error (searchActors):", error);
      // Local fallback in case TMDB search is blocked
      const filtered = FALLBACK_ACTORS.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
      return {
        results: filtered.map((a, idx) => ({
          id: idx + 1000,
          name: a.name,
          profile_path: null,
          known_for_department: "Acting"
        }))
      };
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
    const res = await fetch(`${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    return res.json();
  }
};

// NVIDIA NIM API Recommendations
export const geminiApi = {
  getRecommendations: async (preferences) => {
    try {
      const prompt = `Based on the following user preferences, recommend 5 movies. Respond ONLY with a valid JSON array of objects containing 'title' and 'reason'. Preferences: ${preferences}`;
      const text = await queryNvidiaAI(prompt, "You are a helpful assistant that strictly returns valid JSON arrays of recommended movies without any extra markdown or conversational text.");
      
      const jsonStr = text.match(/\[.*\]/s);
      if (jsonStr) {
        return JSON.parse(jsonStr[0]);
      }
      return [];
    } catch (error) {
      console.warn("NVIDIA Recommendation API failed, using high-quality fallback movies:", error.message);
      // Return highly polished static recommendation list to keep the UI beautiful and fully interactive
      return [
        { title: "Inception", reason: "A mind-bending heist thriller where thief Dom Cobb gets a chance at redemption by planting an idea in a target's subconscious." },
        { title: "The Dark Knight", reason: "An extraordinary superhero noir epic detailing the grueling conflict between the caped crusader and his greatest adversary, the Joker." },
        { title: "Interstellar", reason: "An awe-inspiring sci-fi voyage across space and time that showcases the power of human connection, hope, and sacrifice." },
        { title: "Parasite", reason: "An ingenious, darkly comedic and tense critique of social class dynamics that grips you from start to absolute finish." },
        { title: "Spirited Away", reason: "A stunning, whimsical animated adventure about a young girl trapped in a magical spirit world, featuring beautiful worldbuilding." }
      ];
    }
  }
};
