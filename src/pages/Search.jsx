import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbApi, geminiApi, GENRE_MAP } from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isAiMode, setIsAiMode] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeGenre, setActiveGenre] = useState(null);

  const executeSearch = useCallback(async (searchQuery, aiMode) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setActiveGenre(null);

    try {
      if (aiMode) {
        const aiRecommendations = await geminiApi.getRecommendations(searchQuery);
        if (aiRecommendations.length > 0) {
          const tmdbPromises = aiRecommendations.map(async (rec) => {
            const tmdbRes = await tmdbApi.searchMovies(rec.title);
            if (tmdbRes.results && tmdbRes.results.length > 0) {
              return { ...tmdbRes.results[0], aiReason: rec.reason };
            }
            return null;
          });
          const enrichedResults = (await Promise.all(tmdbPromises)).filter(Boolean);
          setResults(enrichedResults);
        } else {
          setError("CineBrain couldn't generate recommendations. Try different keywords.");
        }
      } else {
        const data = await tmdbApi.searchMovies(searchQuery);
        if (data.results) {
          setResults(data.results);
        }
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during search.");
    } finally {
      setLoading(false);
    }
  }, []);

  const executeGenreSearch = useCallback(async (genreName) => {
    const genreId = GENRE_MAP[genreName];
    if (!genreId) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setActiveGenre(genreName);
    setQuery('');

    try {
      const data = await tmdbApi.discoverByGenre(genreId);
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to discover movies for this genre.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search when coming from Home page with ?q= or ?genre= param
  useEffect(() => {
    const q = searchParams.get('q');
    const genre = searchParams.get('genre');
    if (genre) {
      executeGenreSearch(genre);
    } else if (q) {
      setQuery(q);
      executeSearch(q, false);
    }
  }, [searchParams, executeSearch, executeGenreSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    executeSearch(query, isAiMode);
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 md:px-8">
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-linear-to-r from-brand-deep-purple to-brand-coral-pink">
          Find Your Next Obsession
        </h1>
        
        <form onSubmit={handleSearch} className="relative w-full mb-6">
          <div className={`glass-panel rounded-full p-2 flex items-center shadow-xl transition-all duration-300 border-2 ${isAiMode ? 'border-brand-coral-pink' : 'border-brand-deep-purple/30 focus-within:border-brand-deep-purple'}`}>
            <span className={`material-symbols-outlined ml-4 text-2xl ${isAiMode ? 'text-brand-coral-pink' : 'text-gray-400'}`}>
              {isAiMode ? 'auto_awesome' : 'search'}
            </span>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAiMode ? "Describe what you're in the mood for (e.g. 'A sci-fi movie with a twist ending')" : "Search movies, TV shows..."}
              className="bg-transparent border-none w-full py-4 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-lg"
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`text-white px-8 py-4 rounded-full font-bold transition-all disabled:opacity-50 ${isAiMode ? 'bg-linear-to-r from-brand-coral-pink to-brand-peach-orange shadow-[0_0_20px_rgba(255,111,145,0.4)]' : 'bg-brand-deep-purple hover:bg-brand-pink-purple'}`}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setIsAiMode(false)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${!isAiMode ? 'bg-white/10 text-brand-deep-purple dark:text-brand-primary border border-brand-deep-purple/50' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Standard Search
          </button>
          <button 
            onClick={() => setIsAiMode(true)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors flex items-center gap-1 ${isAiMode ? 'bg-brand-coral-pink/10 text-brand-coral-pink border border-brand-coral-pink/50' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span> CineBrain Magic
          </button>
        </div>
      </div>

      {/* Active Genre Header */}
      {activeGenre && (
        <div className="max-w-360 mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-brand-deep-purple text-3xl">movie_filter</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {activeGenre} Movies
            </h2>
            <span className="glass-panel text-xs font-bold px-3 py-1 rounded-full text-brand-coral-pink">
              {results.length} results
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GENRE_MAP).map(g => (
              <button
                key={g}
                onClick={() => executeGenreSearch(g)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  activeGenre === g
                    ? 'bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white shadow-lg'
                    : 'glass-panel text-gray-700 dark:text-gray-300 hover:text-white hover:bg-brand-deep-purple/80'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-360 mx-auto">
        {error && <p className="text-center text-brand-error mb-8">{error}</p>}
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-2/3 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map(movie => (
              <div key={movie.id} className="relative group">
                <MovieCard 
                  id={movie.id}
                  title={movie.title || movie.name}
                  year={movie.release_date?.substring(0, 4) || movie.first_air_date?.substring(0, 4)}
                  genre=""
                  rating={movie.vote_average?.toFixed(1) || 'N/A'}
                  imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : movie.fallbackImage || 'https://via.placeholder.com/500x750?text=No+Poster'}
                />
                {movie.aiReason && (
                  <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-[#0a0a1a]/95 backdrop-blur-xl border border-brand-coral-pink/30 text-white text-xs p-4 rounded-xl shadow-2xl">
                      <div className="flex items-center gap-1 text-brand-coral-pink mb-1 font-bold">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> CineBrain
                      </div>
                      {movie.aiReason}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {!loading && results.length === 0 && !error && query && (
          <div className="text-center py-20 text-gray-500">
            No results found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
}
