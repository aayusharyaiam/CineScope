import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { tmdbApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import SearchFilter from '../components/SearchFilter';

export default function NewShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loadingShows, setLoadingShows] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const showsGridRef = useRef(null);
  const moviesGridRef = useRef(null);
  const showsAnimated = useRef(false);
  const moviesAnimated = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    tmdbApi.getNewShows().then(data => {
      if (!cancelled && data?.results) setShows(data.results);
      if (!cancelled) setLoadingShows(false);
    });

    tmdbApi.getNowPlayingMovies().then(data => {
      if (!cancelled && data?.results) setMovies(data.results);
      if (!cancelled) setLoadingMovies(false);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loadingShows && shows.length > 0 && showsGridRef.current && !showsAnimated.current) {
      showsAnimated.current = true;
      const cards = showsGridRef.current.querySelectorAll('.show-card');
      gsap.set(cards, { opacity: 0, y: 40 });
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
    }
  }, [loadingShows, shows]);

  useEffect(() => {
    if (!loadingMovies && movies.length > 0 && moviesGridRef.current && !moviesAnimated.current) {
      moviesAnimated.current = true;
      const cards = moviesGridRef.current.querySelectorAll('.movie-card');
      gsap.set(cards, { opacity: 0, y: 40 });
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
    }
  }, [loadingMovies, movies]);

  const renderGrid = (items, ref, cardClass, mediaType, loading, emptyIcon, emptyText, loadingText) => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-lime-yellow/30 border-t-brand-lime-yellow animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-body text-sm animate-pulse">{loadingText}</p>
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <span className="material-symbols-outlined text-5xl text-gray-400">{emptyIcon}</span>
          <p className="text-gray-500 dark:text-gray-400 font-body">{emptyText}</p>
        </div>
      );
    }
    return (
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
        {items.map((item) => (
          <div key={item.id} className={cardClass} style={{ opacity: 0 }}>
            <MovieCard 
              id={item.id}
              title={item.title || item.name || item.original_name}
              year={(item.release_date || item.first_air_date)?.substring(0, 4) || 'N/A'}
              rating={item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
              imageUrl={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : (item.fallbackImage || 'https://via.placeholder.com/500x750?text=No+Poster')}
              mediaType={mediaType}
            />
          </div>
        ))}
      </div>
    );
  };

  const q = searchQuery.toLowerCase();
  const filteredShows = q ? shows.filter(s => (s.name || s.original_name || '').toLowerCase().includes(q)) : shows;
  const filteredMovies = q ? movies.filter(m => (m.title || m.name || '').toLowerCase().includes(q)) : movies;

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-[1440px] mx-auto min-h-screen relative z-10">
      <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Filter shows & movies..." />

      {/* New Shows */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4">
            <span className="w-10 h-1.5 bg-gradient-to-r from-brand-lime-yellow to-brand-peach-orange rounded-full block"></span>
            New &amp; Airing Today — Shows
          </h1>
        </div>
        {renderGrid(filteredShows, showsGridRef, 'show-card', 'tv', loadingShows, 'new_releases', q ? 'No shows match your search.' : 'No new shows airing today.', 'Loading new shows...')}
      </section>

      {/* Now Playing Movies */}
      <section>
        <div className="flex items-end justify-between mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4">
            <span className="w-10 h-1.5 bg-gradient-to-r from-brand-deep-purple to-brand-pink-purple rounded-full block"></span>
            Now Playing — Movies
          </h1>
        </div>
        {renderGrid(filteredMovies, moviesGridRef, 'movie-card', 'movie', loadingMovies, 'movie', q ? 'No movies match your search.' : 'No movies playing right now.', 'Loading movies...')}
      </section>
    </div>
  );
}
