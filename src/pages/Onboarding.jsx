import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GENRE_MAP, tmdbApi } from '../services/api';
import { getUserProfile, saveUserPreferences } from '../services/userProfile';
import { InlineNotice } from '../components/AppState';

const starterTitles = ['Inception', 'Interstellar', 'Breaking Bad', 'The Dark Knight', 'Parasite', 'The Bear'];

export default function Onboarding() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    getUserProfile(currentUser.uid).then(profile => {
      const preferences = profile?.preferences;
      if (preferences) {
        setSelectedGenres(preferences.favoriteGenres || []);
        setSelectedTitles((preferences.favoriteTitles || []).map((title, index) => ({
          tmdbId: preferences.favoriteMovies?.[index] || `saved_${index}`,
          title,
          mediaType: 'movie',
          posterPath: null
        })));
      }
    });
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      const searchTerm = query.trim();
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      Promise.resolve()
        .then(() => {
          if (!cancelled) setLoading(true);
          return tmdbApi.searchMulti(searchTerm);
        })
        .then(data => {
          if (!cancelled) {
            setResults((data.results || [])
              .filter(item => ['movie', 'tv'].includes(item.media_type) && (item.title || item.name))
              .slice(0, 8));
          }
        })
        .catch(error => {
          console.error('Onboarding search failed:', error);
          if (!cancelled) setNotice('Title search is unavailable right now. You can still choose genres and save.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    const timeout = setTimeout(runSearch, 350);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const canSave = selectedTitles.length >= 3 || selectedGenres.length >= 2;
  const genreNames = useMemo(() => Object.keys(GENRE_MAP), []);

  if (!currentUser) return <Navigate to="/auth" replace />;

  const toggleTitle = (item) => {
    const title = item.title || item.name;
    const favorite = {
      tmdbId: item.id,
      title,
      mediaType: item.media_type === 'tv' ? 'tv' : 'movie',
      posterPath: item.poster_path || null
    };

    setSelectedTitles(prev => (
      prev.some(existing => existing.tmdbId === favorite.tmdbId)
        ? prev.filter(existing => existing.tmdbId !== favorite.tmdbId)
        : [...prev, favorite].slice(0, 15)
    ));
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => (
      prev.includes(genre)
        ? prev.filter(item => item !== genre)
        : [...prev, genre]
    ));
  };

  const addStarterTitle = (title) => {
    setQuery(title);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const ok = await saveUserPreferences(currentUser.uid, {
      favoriteMovies: selectedTitles.map(item => item.tmdbId),
      favoriteTitles: selectedTitles.map(item => item.title),
      favoriteGenres: selectedGenres,
      favoriteActors: [],
      favoriteDirectors: []
    });
    setSaving(false);
    if (ok) {
      navigate('/', { replace: true });
    } else {
      setNotice('Your taste profile could not be saved. Check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 pb-20 pt-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5">
          <div className="sticky top-28">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coral-pink/10 text-brand-coral-pink text-xs font-bold uppercase tracking-wider mb-5">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              CineBrain setup
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Tell CineScope what you love watching.
            </h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Pick a few favorites and genres. CineBrain will use this with your future ratings and watch history to generate weekly recommendations.
            </p>

            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Taste signal</span>
                <span className="text-brand-coral-pink font-bold">{selectedTitles.length} titles, {selectedGenres.length} genres</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-brand-deep-purple to-brand-coral-pink transition-all"
                  style={{ width: `${Math.min(((selectedTitles.length + selectedGenres.length) / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="w-full min-h-11 rounded-xl bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {saving ? 'Saving taste profile...' : 'Start my AI recommendations'}
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full min-h-11 rounded-xl border border-white/15 text-gray-600 dark:text-gray-300 hover:bg-white/10 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-8">
          <div className="glass-panel rounded-2xl p-5">
            {notice && (
              <div className="mb-5">
                <InlineNotice
                  icon="info"
                  tone="danger"
                  title="Taste setup needs attention"
                  message={notice}
                />
              </div>
            )}
            <label htmlFor="favorite-search" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
              Search movies and series
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                id="favorite-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a title you already love..."
                className="w-full rounded-xl border border-white/15 bg-white/70 dark:bg-black/20 py-4 pl-12 pr-4 outline-none focus:border-brand-coral-pink"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {starterTitles.map(title => (
                <button
                  key={title}
                  onClick={() => addStarterTitle(title)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/60 dark:bg-white/10 hover:bg-brand-deep-purple hover:text-white transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loading && [...Array(4)].map((_, index) => (
                <div key={index} className="h-20 rounded-xl bg-white/10 animate-pulse"></div>
              ))}

              {!loading && results.map(item => {
                const title = item.title || item.name;
                const selected = selectedTitles.some(existing => existing.tmdbId === item.id);
                return (
                  <button
                    key={`${item.media_type}_${item.id}`}
                    onClick={() => toggleTitle(item)}
                    className={`min-h-20 rounded-xl p-3 flex items-center gap-3 text-left transition-all border ${
                      selected
                        ? 'border-brand-coral-pink bg-brand-coral-pink/10'
                        : 'border-white/10 bg-white/50 dark:bg-white/5 hover:border-brand-deep-purple/60'
                    }`}
                  >
                    <img
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://via.placeholder.com/92x138?text=?'}
                      alt={title}
                      className="w-11 h-16 rounded-lg object-cover bg-gray-200 dark:bg-white/10"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-gray-900 dark:text-white truncate">{title}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{item.media_type === 'tv' ? 'Series' : 'Movie'}</span>
                    </span>
                    <span className="material-symbols-outlined text-brand-coral-pink">
                      {selected ? 'check_circle' : 'add_circle'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-xl font-bold mb-4">Favorite genres</h2>
            <div className="flex flex-wrap gap-3">
              {genreNames.map(genre => {
                const selected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`min-h-11 px-4 rounded-full text-sm font-semibold transition-all ${
                      selected
                        ? 'bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white'
                        : 'bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/15'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTitles.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="font-display text-xl font-bold mb-4">Selected favorites</h2>
              <div className="flex flex-wrap gap-2">
                {selectedTitles.map(item => (
                  <button
                    key={item.tmdbId}
                    onClick={() => setSelectedTitles(prev => prev.filter(existing => existing.tmdbId !== item.tmdbId))}
                    className="px-3 py-2 rounded-full bg-brand-deep-purple/10 text-brand-deep-purple dark:text-brand-primary text-xs font-bold flex items-center gap-1"
                  >
                    {item.title}
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
