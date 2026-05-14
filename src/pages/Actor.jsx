import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import { EmptyState, ErrorState, LoadingState } from '../components/AppState';

export default function Actor() {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    // If no ID provided, use a popular actor ID for demonstration (e.g. Leonardo DiCaprio 112)
    const fetchActor = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const data = await tmdbApi.getPersonDetails(id || 112);
        setActor(data);
      } catch (error) {
        console.error('Error fetching actor details:', error);
        setFetchError('This profile could not be loaded right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchActor();
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 py-12">
        <LoadingState title="Loading profile" message="Gathering biography and filmography..." />
      </div>
    );
  }

  if (!actor || actor.error || fetchError) {
    return (
      <div className="px-4 py-12 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Profile unavailable"
          message={fetchError || 'This actor or director profile is missing from the catalog right now.'}
          actionLabel="Browse actors"
          actionTo="/actors"
          className="w-full max-w-2xl"
        />
      </div>
    );
  }

  // Combine movie and TV credits
  const knownFor = [...(actor.movie_credits?.cast || []), ...(actor.tv_credits?.cast || [])]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8); // Top 8 known for

  const filmography = [...(actor.movie_credits?.cast || []), ...(actor.tv_credits?.cast || [])]
    .sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      return dateB.localeCompare(dateA); // newest first
    });

  const profileImageUrl = actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500';

  return (
    <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-20">
      
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-deep-purple/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-coral-pink/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Actor Profile (Sticky) */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 relative">
          <div className="md:sticky md:top-28 glass-panel border-white/50 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Blurred Backdrop Image */}
            <div className="absolute inset-x-0 top-0 h-48 z-0">
              <img src={profileImageUrl} className="w-full h-full object-cover opacity-30 mix-blend-overlay blur-sm" alt="Backdrop" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-white dark:from-transparent dark:via-[#211e25]/80 dark:to-[#211e25]"></div>
            </div>

            {/* Profile Content */}
            <div className="relative z-10 px-8 pt-20 pb-8 flex flex-col items-center text-center">
              <div className="w-40 h-40 rounded-full border-4 border-white dark:border-[#211e25] p-1 shadow-2xl mb-6 relative group">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-[#0a0a0f]">
                  <img src={profileImageUrl} alt={actor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-deep-purple to-brand-coral-pink opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10"></div>
              </div>

              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{actor.name}</h1>
              <p className="font-body text-brand-deep-purple dark:text-brand-primary font-bold tracking-wide mb-8">{actor.known_for_department}</p>

              <div className="w-full grid grid-cols-2 gap-4 mb-8 text-left bg-gray-100 dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Born</p>
                  <p className="text-sm text-gray-800 dark:text-gray-100">{actor.birthday || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Place</p>
                  <p className="text-sm text-gray-800 dark:text-gray-100 truncate" title={actor.place_of_birth}>{actor.place_of_birth?.split(',').pop() || 'Unknown'}</p>
                </div>
              </div>

              <div className="text-left w-full">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Biography</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-6">
                  {actor.biography || "Biography not available."}
                </p>
                {actor.biography && (
                  <button className="mt-3 text-xs font-bold text-brand-deep-purple dark:text-brand-primary hover:text-brand-coral-pink transition-colors uppercase tracking-widest flex items-center gap-1">
                    Read More <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Content Grid & List */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col gap-16">
          
          {/* Known For Section */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-1 bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink rounded-full block"></span>
                Known For
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {knownFor.length > 0 ? knownFor.map(credit => (
                <MovieCard 
                  key={`${credit.media_type}-${credit.id}`}
                  id={credit.id}
                  title={credit.title || credit.name}
                  year={credit.release_date?.substring(0, 4) || credit.first_air_date?.substring(0, 4)}
                  rating={credit.vote_average?.toFixed(1)}
                  imageUrl={credit.poster_path ? `https://image.tmdb.org/t/p/w500${credit.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                />
              )) : (
                <div className="col-span-full">
                  <EmptyState title="Known-for credits are unavailable" message="This profile does not have highlighted titles yet." />
                </div>
              )}
            </div>
          </section>

          {/* Filmography List */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-1 bg-gradient-to-r from-brand-coral-pink to-brand-deep-purple rounded-full block"></span>
                Filmography
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {filmography.length > 0 ? filmography.slice(0, 10).map((credit, idx) => (
                <Link to={`/movie/${credit.id}`} key={`${credit.media_type}-${credit.id}-${idx}`} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-gray-50/80 dark:bg-[#100d13]/50 border border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-[#211e25]/80 hover:border-gray-300 dark:hover:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-deep-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <span className="font-display text-xl text-gray-400 dark:text-gray-500 w-12 text-center group-hover:text-brand-deep-purple dark:group-hover:text-brand-primary transition-colors">
                      {credit.release_date?.substring(0, 4) || credit.first_air_date?.substring(0, 4) || '---'}
                    </span>
                    <div>
                      <h4 className="font-display text-lg text-gray-900 dark:text-white mb-1 group-hover:text-brand-deep-purple dark:group-hover:text-brand-primary transition-colors">{credit.title || credit.name}</h4>
                      <p className="font-body text-sm text-gray-500 dark:text-gray-400">as {credit.character || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 flex items-center gap-3 relative z-10 sm:justify-end pl-18 sm:pl-0">
                    <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-[#3b383f] text-gray-700 dark:text-white text-xs font-bold border border-gray-300 dark:border-white/5 uppercase tracking-widest">
                      {credit.media_type === 'tv' ? 'TV Show' : 'Movie'}
                    </span>
                  </div>
                </Link>
              )) : (
                <EmptyState title="Filmography unavailable" message="No credits are listed for this profile yet." />
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
