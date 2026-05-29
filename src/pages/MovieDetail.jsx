import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tmdbApi, omdbApi } from '../services/api';
import UserActions from '../components/UserActions';
import ImageWithFallback from '../components/ImageWithFallback';
import { DetailSkeleton } from '../components/Skeleton';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [omdbData, setOmdbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await tmdbApi.getMovieDetails(id);
        setMovie(data);
        if (data.imdb_id) {
          const omdbRes = await omdbApi.getRatings(data.imdb_id);
          setOmdbData(omdbRes);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="material-symbols-outlined text-6xl text-brand-coral-pink/60 mb-4">search_off</span>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Movie not found</h2>
        <p className="text-gray-400 mb-6">We couldn't find the movie you're looking for.</p>
        <Link to="/" className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all active:scale-95">
          Back to Home
        </Link>
      </div>
    );
  }

  // Extract OMDB ratings
  let imdbRating = omdbData?.imdbRating || movie.vote_average?.toFixed(1);
  let rtRating = omdbData?.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A';
  let metacriticRating = omdbData?.Metascore || 'N/A';

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <div className="relative w-full min-h-screen pb-32">
      {/* Hero Backdrop */}
      <div className="absolute inset-0 w-full h-[600px] md:h-[800px] z-0 -mt-24 md:-mt-28">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url('${backdropUrl}')`, backgroundAttachment: 'fixed' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/60 to-transparent"></div>
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
      <main className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-20 pt-[300px] md:pt-[400px]">
        
        {/* Header Info */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-16">
          
          {/* Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 lg:w-80 group mx-auto lg:mx-0 -mt-20 lg:-mt-0">
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(132,94,194,0.3)] aspect-[2/3] relative">
              <ImageWithFallback src={posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" fallbackIndex={movie.id} />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                <span className="text-brand-amber-yellow">★ {movie.vote_average?.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex-grow pt-4">
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
                <span key={g.id} className="glass-panel px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gradient-to-r hover:from-brand-deep-purple hover:to-brand-coral-pink transition-all cursor-pointer">
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
                  className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-display font-semibold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all active:scale-95"
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

          {/* AI Teaser */}
          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl font-bold border-l-4 border-brand-coral-pink pl-4 mb-6">AI Insight</h2>
            <div className="glass-panel rounded-xl p-1 relative overflow-hidden h-full min-h-[200px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-deep-purple/20 to-brand-coral-pink/20 z-0"></div>
              <div className="relative z-10 bg-[#0a0a1a]/80 backdrop-blur-xl rounded-lg p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-brand-coral-pink">psychology</span>
                    <span className="text-xs uppercase tracking-widest text-brand-coral-pink font-bold">CineBrain Analysis</span>
                  </div>
                  <p className="text-sm text-gray-300 italic mb-4">
                    "Based on your taste profile, this movie aligns perfectly with your love for {movie.genres?.[0]?.name} and stunning visuals."
                  </p>
                </div>
                <button className="w-full py-2 border border-brand-deep-purple/50 rounded-lg text-sm font-semibold text-brand-deep-purple hover:bg-brand-deep-purple/10 transition-colors">
                  Generate Full Breakdown
                </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* Top Cast Section */}
        {movie.credits?.cast?.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-2xl font-bold border-l-4 border-brand-coral-pink pl-4 text-white">Top Cast</h2>
              <div className="hidden md:flex gap-2">
                <button onClick={() => { const el = document.getElementById('cast-scroll'); if (el) el.scrollBy({ left: -320, behavior: 'smooth' }); }} className="glass-panel w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-deep-purple hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={() => { const el = document.getElementById('cast-scroll'); if (el) el.scrollBy({ left: 320, behavior: 'smooth' }); }} className="glass-panel w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-deep-purple hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div id="cast-scroll" className="flex overflow-x-auto gap-6 pb-6 scroll-smooth [-ms-overflow-style:none]">
              {movie.credits.cast.slice(0, 10).map(actor => {
                const actorProfileUrl = actor.profile_path 
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
                  : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=185';
                return (
                  <Link 
                    to={`/actor/${actor.id}`} 
                    key={actor.id} 
                    className="w-36 shrink-0 group hover:-translate-y-1.5 transition-all duration-300 block"
                  >
                    <div className="w-36 h-48 rounded-2xl overflow-hidden shadow-lg border border-white/5 relative bg-[#100d13] mb-3">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-3">
                        <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">View Profile</span>
                      </div>
                      <ImageWithFallback
                        src={actorProfileUrl}
                        alt={actor.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        fallbackIndex={actor.id}
                      />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white group-hover:text-brand-coral-pink transition-colors text-center truncate">{actor.name}</h4>
                    <p className="font-body text-xs text-gray-400 text-center truncate">{actor.character}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* User Actions */}
        <div className="mt-16">
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
