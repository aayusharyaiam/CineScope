import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUserMedia } from '../services/userMedia';
import MovieCard from '../components/MovieCard';
import ImageWithFallback from '../components/ImageWithFallback';
import { ProfileSkeleton } from '../components/Skeleton';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('history');

  const { currentUser } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      getAllUserMedia(currentUser.uid).then(items => {
        setMediaItems(items || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser && !loading) {
    return <Navigate to="/auth" />;
  }

  const watchedItems = mediaItems.filter(m => m.status === 'watched').sort((a, b) => b.addedAt - a.addedAt);
  const watchlistItems = mediaItems.filter(m => m.status === 'watchlist').sort((a, b) => b.addedAt - a.addedAt);
  const reviewedItems = mediaItems.filter(m => m.rating > 0).sort((a, b) => b.addedAt - a.addedAt);
  const favoritedItems = mediaItems.filter(m => m.isFavorite).sort((a, b) => b.addedAt - a.addedAt);
  
  const moviesWatched = watchedItems.filter(m => m.mediaType === 'movie').length;
  const tvWatched = watchedItems.filter(m => m.mediaType === 'tv').length;
  const totalWatched = watchedItems.length;
  const estimatedHours = Math.round((moviesWatched * 2) + (tvWatched * 0.75));

  // Basic stats mapped to current user or default if empty
  const user = {
    name: currentUser?.displayName || 'CineScope User',
    username: currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@user',
    level: Math.floor(totalWatched / 10) + 1,
    xp: (totalWatched % 10) * 100 + (reviewedItems.length * 50),
    maxXp: 1000,
    stats: {
      titlesWatched: totalWatched,
      hoursWatched: estimatedHours,
      reviews: reviewedItems.length,
      favorites: favoritedItems.length
    },
    avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500'
  };

  return (
    <div className="pt-8 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto min-h-screen relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Sidebar (Profile Info & Stats) */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          {/* Profile Card */}
          <div className="glass-panel rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-deep-purple/20 to-transparent"></div>
            
            <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-brand-deep-purple via-brand-coral-pink to-brand-primary mb-4 z-10 shadow-[0_0_30px_rgba(132,94,194,0.4)]">
              <ImageWithFallback src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#211e25]" />
            </div>
            
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1 z-10">{user.name}</h1>
            <p className="font-body text-gray-500 dark:text-gray-400 mb-4 z-10">{user.username}</p>
            
            <div className="bg-brand-deep-purple/10 dark:bg-brand-deep-purple/20 border border-brand-deep-purple/30 text-brand-deep-purple dark:text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold mb-6 flex items-center gap-2 z-10 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] fill-current">star</span>
              Film Enthusiast
            </div>

            {/* Level Progress */}
            <div className="w-full z-10 text-left">
              <div className="flex justify-between items-end mb-2">
                <span className="font-body text-sm text-gray-800 dark:text-white font-bold">Level {user.level}</span>
                <span className="font-body text-gray-500 dark:text-gray-400 text-xs">{user.xp.toLocaleString()} / {user.maxXp.toLocaleString()} XP</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-[#2c292f] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink rounded-full transition-all duration-1000"
                  style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel border-white/50 dark:border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-brand-deep-purple mb-2 text-3xl">movie</span>
              <span className="font-display text-xl text-gray-900 dark:text-white font-bold">{user.stats.titlesWatched.toLocaleString()}</span>
              <span className="font-body text-gray-500 dark:text-gray-400 text-xs mt-1 uppercase tracking-wider">Titles Watched</span>
            </div>
            <div className="glass-panel border-white/50 dark:border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-brand-coral-pink mb-2 text-3xl">schedule</span>
              <span className="font-display text-xl text-gray-900 dark:text-white font-bold">{user.stats.hoursWatched.toLocaleString()}</span>
              <span className="font-body text-gray-500 dark:text-gray-400 text-xs mt-1 uppercase tracking-wider">Hours Watched</span>
            </div>
            <div className="glass-panel border-white/50 dark:border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-yellow-500 dark:text-[#ffc75f] mb-2 text-3xl">reviews</span>
              <span className="font-display text-xl text-gray-900 dark:text-white font-bold">{user.stats.reviews.toLocaleString()}</span>
              <span className="font-body text-gray-500 dark:text-gray-400 text-xs mt-1 uppercase tracking-wider">Reviews Written</span>
            </div>
            <div className="glass-panel border-white/50 dark:border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-pink-500 dark:text-[#f9f871] mb-2 text-3xl">favorite</span>
              <span className="font-display text-xl text-gray-900 dark:text-white font-bold">{user.stats.favorites.toLocaleString()}</span>
              <span className="font-body text-gray-500 dark:text-gray-400 text-xs mt-1 uppercase tracking-wider">Favorites</span>
            </div>
          </div>
        </aside>

        {/* Right Content Area (Tabs & Lists) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-white/10 gap-8 overflow-x-auto hide-scrollbar">
            {['history', 'watchlist', 'reviews', 'favorites'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-display text-lg relative capitalize transition-colors ${
                  activeTab === tab ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab === 'history' ? 'Watch History' : tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink shadow-[0_0_10px_rgba(255,111,145,0.5)]"></div>
                )}
              </button>
            ))}
            
            <button className="pb-4 font-display text-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">file_download</span>
              Import
            </button>
          </div>

          {/* Content Area */}
          <div className="flex flex-col gap-4 mt-2">
            {loading ? (
              <ProfileSkeleton />
            ) : (
              <>
                {activeTab === 'history' && (
                  <>
                    {watchedItems.length === 0 ? (
                      <div className="py-20 text-center text-gray-500 dark:text-gray-400 font-body">
                        <span className="material-symbols-outlined text-5xl mb-4 text-gray-300 dark:text-gray-600">history</span>
                        <p>You haven't watched anything yet.</p>
                        <Link to="/" className="text-brand-deep-purple dark:text-brand-primary font-semibold hover:text-brand-coral-pink transition-colors mt-2 inline-block">Discover Movies & Shows</Link>
                      </div>
                    ) : (
                      <>
                        {watchedItems.map(item => (
                          <Link to={`/${item.mediaType === 'tv' ? 'show' : 'movie'}/${item.mediaId}`} key={item.id} className="glass-panel border-white/50 dark:border-white/5 rounded-xl p-4 flex gap-6 items-center group cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#37333a]/80">
                            <div className="w-16 h-24 bg-gray-200 dark:bg-[#2c292f] rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
                              <ImageWithFallback src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-deep-purple dark:group-hover:text-brand-primary transition-colors">{item.title}</h3>
                              <p className="font-body text-gray-500 dark:text-gray-400 text-sm mb-2">Watched on {new Date(item.addedAt).toLocaleDateString()}</p>
                              {item.rating > 0 && (
                                <div className="flex items-center gap-1 text-yellow-500 dark:text-[#ffc75f]">
                                  {[...Array(5)].map((_, i) => (
                                    <span 
                                      key={i} 
                                      className="material-symbols-outlined text-[16px]"
                                      style={{ fontVariationSettings: i < (item.rating || 0) ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                      star
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                  </>
                )}

                {activeTab === 'watchlist' && (
                  <>
                    {watchlistItems.length === 0 ? (
                      <div className="py-20 text-center text-gray-500 dark:text-gray-400 font-body">
                        <span className="material-symbols-outlined text-5xl mb-4 text-gray-300 dark:text-gray-600">bookmark_border</span>
                        <p>Your watchlist is empty.</p>
                        <Link to="/" className="text-brand-deep-purple dark:text-brand-primary font-semibold hover:text-brand-coral-pink transition-colors mt-2 inline-block">Discover Movies</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {watchlistItems.map(item => (
                          <div key={item.id} className="relative group">
                            <MovieCard 
                              id={item.mediaId}
                              title={item.title}
                              year={new Date(item.addedAt).getFullYear().toString()}
                              rating={null}
                              imageUrl={item.posterUrl}
                              mediaType={item.mediaType}
                              fluid={true}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'reviews' && (
                  <>
                    {reviewedItems.length === 0 ? (
                      <div className="py-20 text-center text-gray-500 dark:text-gray-400 font-body">
                        <span className="material-symbols-outlined text-5xl mb-4 text-gray-300 dark:text-gray-600">reviews</span>
                        <p>You haven't written any reviews yet.</p>
                      </div>
                    ) : (
                      <>
                        {reviewedItems.map(item => (
                          <Link to={`/${item.mediaType === 'tv' ? 'show' : 'movie'}/${item.mediaId}`} key={item.id} className="glass-panel border-white/50 dark:border-white/5 rounded-xl p-4 flex gap-6 items-center group cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#37333a]/80">
                            <div className="w-16 h-24 bg-gray-200 dark:bg-[#2c292f] rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
                              <ImageWithFallback src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-deep-purple dark:group-hover:text-brand-primary transition-colors">{item.title}</h3>
                              <p className="font-body text-gray-500 dark:text-gray-400 text-sm mb-2">Rated on {new Date(item.addedAt).toLocaleDateString()}</p>
                              <div className="flex items-center gap-1 text-yellow-500 dark:text-[#ffc75f]">
                                {[...Array(5)].map((_, i) => (
                                  <span 
                                    key={i} 
                                    className="material-symbols-outlined text-[16px]"
                                    style={{ fontVariationSettings: i < (item.rating || 0) ? "'FILL' 1" : "'FILL' 0" }}
                                  >
                                    star
                                  </span>
                                ))}
                                <span className="ml-2 font-bold text-gray-900 dark:text-white">{item.rating}/5</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                  </>
                )}

                {activeTab === 'favorites' && (
                  <>
                    {favoritedItems.length === 0 ? (
                      <div className="py-20 text-center text-gray-500 dark:text-gray-400 font-body">
                        <span className="material-symbols-outlined text-5xl mb-4 text-gray-300 dark:text-gray-600">favorite</span>
                        <p>You haven't favorited any titles yet.</p>
                        <Link to="/" className="text-brand-coral-pink dark:text-brand-primary font-semibold hover:text-brand-deep-purple transition-colors mt-2 inline-block">Explore Movies</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {favoritedItems.map(item => (
                          <div key={item.id} className="relative group">
                            <MovieCard 
                              id={item.mediaId}
                              title={item.title}
                              year={new Date(item.addedAt).getFullYear().toString()}
                              rating={item.rating > 0 ? item.rating : null}
                              imageUrl={item.posterUrl}
                              mediaType={item.mediaType}
                              fluid={true}
                            />
                            <div className="absolute top-2 left-2 text-brand-coral-pink z-20">
                              <span className="material-symbols-outlined text-2xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
