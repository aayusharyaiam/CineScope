import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbApi, omdbApi } from '../services/api';
import UserActions from '../components/UserActions';
import AiRecommendationBlock from '../components/AiRecommendationBlock';
import { ErrorState, LoadingState } from '../components/AppState';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [omdbData, setOmdbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const data = await tmdbApi.getMovieDetails(id);
        setMovie(data);
        if (data.imdb_id) {
          const omdbRes = await omdbApi.getRatings(data.imdb_id);
          setOmdbData(omdbRes);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setFetchError('Movie details could not be loaded right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 py-12">
        <LoadingState title="Loading the feature presentation" message="Fetching details, ratings, cast, and trailers..." />
      </div>
    );
  }

  if (!movie || fetchError || movie.title === 'Movie Info Unavailable') {
    return (
      <div className="px-4 py-12 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Movie details are unavailable"
          message={fetchError || movie?.overview || 'The catalog could not return this movie. It may be unavailable or temporarily blocked.'}
          actionLabel="Back to search"
          actionTo="/search"
          className="w-full max-w-2xl"
        />
      </div>
    );
  }

  // Extract OMDB ratings
  let imdbRating = omdbData?.imdbRating || movie.vote_average?.toFixed(1);
  let rtRating = omdbData?.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A';
  let metacriticRating = omdbData?.Metascore || 'N/A';

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600';
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="relative w-full min-h-screen pb-32">
      {/* Hero Backdrop */}
      <div className="absolute inset-0 w-full h-150 md:h-200 z-0 -mt-24 md:mt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url('${backdropUrl}')`, backgroundAttachment: 'fixed' }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a1a] via-[#0a0a1a]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0a1a] opacity-80"></div>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 z-20 glass-panel w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-deep-purple hover:text-white transition-colors text-white"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-360 mx-auto px-4 md:px-20 pt-75 md:pt-100">
        
        {/* Header Info */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-16">
          
          {/* Poster */}
          <div className="shrink-0 w-48 md:w-64 lg:w-80 group mx-auto lg:mx-0 -mt-20 lg:mt-0">
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(132,94,194,0.3)] aspect-2/3 relative">
              <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                <span className="text-brand-amber-yellow">★ {movie.vote_average?.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grow pt-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <div className="glass-panel px-4 py-1.5 rounded-full text-gray-300">{movie.release_date?.substring(0, 4)}</div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="glass-panel px-4 py-1.5 rounded-full text-gray-300">{movie.runtime} min</div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="glass-panel px-4 py-1.5 rounded-full text-brand-lime-yellow border-brand-lime-yellow/30 font-bold">{movie.status}</div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {movie.genres?.map(g => (
                <span key={g.id} className="glass-panel px-4 py-2 rounded-lg text-sm font-semibold hover:bg-linear-to-r hover:from-brand-deep-purple hover:to-brand-coral-pink transition-all cursor-pointer">
                  {g.name}
                </span>
              ))}
            </div>
            
            <p className="text-gray-300 max-w-3xl mb-8 leading-relaxed text-lg italic">
              {movie.tagline}
            </p>
            <p className="text-gray-300 max-w-3xl mb-8 leading-relaxed">
              {movie.overview}
            </p>
            
            <div className="flex gap-4">
              {movie.videos?.results?.length > 0 && (
                <a 
                  href={`https://www.youtube.com/watch?v=${movie.videos.results[0].key}`}
                  target="_blank" rel="noreferrer"
                  className="bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-display font-semibold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Ratings & AI Teaser Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ratings Widget */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-display text-2xl font-bold border-l-4 border-brand-deep-purple pl-4">Critical Consensus</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform">
                <div className="font-display text-4xl font-extrabold text-brand-amber-yellow">{imdbRating}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">IMDb</div>
              </div>
              <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform border-t-2 border-t-brand-coral-pink">
                <div className="font-display text-4xl font-extrabold text-brand-coral-pink">{rtRating}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Rotten Tomatoes</div>
              </div>
              <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform border-t-2 border-t-brand-lime-yellow">
                <div className="font-display text-4xl font-extrabold text-brand-lime-yellow">{metacriticRating}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Metacritic</div>
              </div>
            </div>
          </div>

          {/* Cast Highlights */}
          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl font-bold border-l-4 border-brand-coral-pink pl-4 mb-6">Top Cast</h2>
            <div className="space-y-3">
              {movie.credits?.cast?.slice(0, 5).map(actor => (
                <button
                  key={actor.id}
                  onClick={() => navigate(`/actor/${actor.id}`)}
                  className="glass-panel rounded-lg p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform w-full text-left"
                >
                  <img
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w92${actor.profile_path}` : 'https://via.placeholder.com/92x138?text=?'}
                    alt={actor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>
                    <span className="block text-sm font-bold text-white">{actor.name}</span>
                    <span className="block text-xs text-gray-400">{actor.character}</span>
                  </span>
                </button>
              ))}
              {movie.credits?.cast?.length === 0 && (
                <p className="text-sm text-gray-400">Cast details unavailable.</p>
              )}
              </div>
          </div>
          
        </div>

        <AiRecommendationBlock title={movie.title} mediaType="movie" />

        {/* User Actions */}
        <div className="mt-10">
          <UserActions 
            mediaType="movie" 
            mediaId={id} 
            title={movie.title} 
            posterUrl={posterUrl}
          />
        </div>
        
      </main>
    </div>
  );
}
