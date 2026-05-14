import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbApi, omdbApi } from '../services/api';
import UserActions from '../components/UserActions';

export default function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [omdbData, setOmdbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await tmdbApi.getShowDetails(id);
        if (!cancelled) setShow(data);

        // Try to get OMDB ratings using show name
        if (data.name) {
          try {
            const omdbRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(data.name)}&type=series&apikey=${import.meta.env.VITE_OMDB_API_KEY}`);
            const omdbJson = await omdbRes.json();
            if (!cancelled && omdbJson.Response === "True") setOmdbData(omdbJson);
          } catch (e) { /* omdb optional */ }
        }
      } catch (error) {
        console.error("Error fetching show details:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-brand-coral-pink/30 border-t-brand-coral-pink animate-spin"></div>
      </div>
    );
  }

  if (!show) {
    return <div className="text-center py-20 text-white font-display">Show not found.</div>;
  }

  const imdbRating = omdbData?.imdbRating || show.vote_average?.toFixed(1);
  const rtRating = omdbData?.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A';
  const metacriticRating = omdbData?.Metascore || 'N/A';

  const backdropUrl = show.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` 
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600';
  const posterUrl = show.poster_path 
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster';

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

      {/* Main Content */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-20 pt-[300px] md:pt-[400px]">
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-16">
          
          {/* Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 lg:w-80 group mx-auto lg:mx-0 -mt-20 lg:-mt-0">
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(132,94,194,0.3)] aspect-[2/3] relative">
              <img src={posterUrl} alt={show.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                <span className="text-brand-amber-yellow">★ {show.vote_average?.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex-grow pt-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-brand-coral-pink/20 text-brand-coral-pink text-xs font-bold px-3 py-1 rounded-full border border-brand-coral-pink/30">📺 TV Series</span>
              {show.status && (
                <span className="glass-panel px-3 py-1 rounded-full text-xs font-bold text-brand-lime-yellow border-brand-lime-yellow/30">{show.status}</span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">{show.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <div className="glass-panel px-4 py-1.5 rounded-full text-gray-300">{show.first_air_date?.substring(0, 4)}</div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="glass-panel px-4 py-1.5 rounded-full text-gray-300">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="glass-panel px-4 py-1.5 rounded-full text-gray-300">{show.number_of_episodes} Episodes</div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {show.genres?.map(g => (
                <span key={g.id} className="glass-panel px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gradient-to-r hover:from-brand-deep-purple hover:to-brand-coral-pink transition-all cursor-pointer">
                  {g.name}
                </span>
              ))}
            </div>
            
            {show.tagline && (
              <p className="text-gray-300 max-w-3xl mb-4 leading-relaxed text-lg italic">
                {show.tagline}
              </p>
            )}
            <p className="text-gray-300 max-w-3xl mb-8 leading-relaxed">
              {show.overview}
            </p>
            
            <div className="flex gap-4">
              {show.videos?.results?.length > 0 && (
                <a 
                  href={`https://www.youtube.com/watch?v=${show.videos.results[0].key}`}
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

        {/* Ratings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              {show.credits?.cast?.slice(0, 5).map(actor => (
                <div key={actor.id} className="glass-panel rounded-lg p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                  <img 
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w92${actor.profile_path}` : 'https://via.placeholder.com/92x138?text=?'} 
                    alt={actor.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{actor.name}</p>
                    <p className="text-xs text-gray-400">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="mt-10">
          <UserActions 
            mediaType="tv" 
            mediaId={id} 
            title={show.name} 
            posterUrl={posterUrl}
          />
        </div>

      </main>
    </div>
  );
}
