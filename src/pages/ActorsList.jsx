import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { tmdbApi } from '../services/api';
import SearchFilter from '../components/SearchFilter';
import ImageWithFallback from '../components/ImageWithFallback';
import { CardSkeleton } from '../components/Skeleton';

export default function ActorsList() {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);
  const animated = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch either popular actors or query actors dynamically
  useEffect(() => {
    let cancelled = false;
    
    const fetchActors = async () => {
      setLoading(true);
      try {
        if (searchQuery.trim()) {
          const data = await tmdbApi.searchActors(searchQuery);
          if (!cancelled && data && data.results) {
            setActors(data.results);
            animated.current = false; // Reset animation for new search results
          }
        } else {
          const data = await tmdbApi.getPopularActors();
          if (!cancelled && data && data.results) {
            setActors(data.results);
            animated.current = false; // Reset animation for popular actors
          }
        }
      } catch (err) {
        console.error("Failed to load actors:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Debounce the live search by 300ms, query instantly if query is empty
    const debounceTimer = setTimeout(() => {
      fetchActors();
    }, searchQuery.trim() ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  // Animate cards after they render
  useEffect(() => {
    if (!loading && actors.length > 0 && gridRef.current && !animated.current) {
      animated.current = true;
      const cards = gridRef.current.querySelectorAll('.actor-card');
      gsap.set(cards, { opacity: 0, y: 40 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power3.out',
        delay: 0.1
      });
    }
  }, [loading, actors]);

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-[1440px] mx-auto min-h-screen relative z-10">
      <div className="flex items-end justify-between mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4">
          <span className="w-10 h-1.5 bg-gradient-to-r from-brand-deep-purple to-brand-pink-purple rounded-full block"></span>
          {searchQuery ? 'Search Results' : 'Popular Actors'}
        </h1>
      </div>

      <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Search actors..." />

      {(() => {
        if (loading) return <CardSkeleton count={10} fluid={true} />;
        
        if (actors.length === 0) return (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <span className="material-symbols-outlined text-5xl text-gray-400">person</span>
            <p className="text-gray-500 dark:text-gray-400 font-body">No actors match your search.</p>
          </div>
        );

        return (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {actors.map((actor) => (
              <Link to={`/actor/${actor.id}`} key={actor.id} className="actor-card group flex flex-col items-center" style={{ opacity: 0 }}>
                <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-200 dark:border-white/5 relative bg-[#100d13]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <ImageWithFallback
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : (actor.fallbackImage || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500')}
                    alt={actor.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fallbackIndex={actor.id}
                  />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-deep-purple dark:group-hover:text-brand-primary transition-colors text-center">{actor.name}</h3>
                <p className="font-body text-sm text-gray-500 dark:text-gray-400 text-center capitalize">{actor.known_for_department || 'Acting'}</p>
              </Link>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
