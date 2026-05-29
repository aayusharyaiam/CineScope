import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MovieCard from '../components/MovieCard';
import ImageWithFallback from '../components/ImageWithFallback';
import { tmdbApi, getPickOfTheDay } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Documentary', 'Thriller', 'Animation', 'Fantasy', 'Mystery', 'Adventure'];

export default function Home() {
  const heroRef = useRef(null);
  const rowRef = useRef(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [pickOfDay, setPickOfDay] = useState(null);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();
  
  // Drag-to-scroll using refs (avoids React state async race conditions)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [dragCursor, setDragCursor] = useState('cursor-grab');

  const scrollRow = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse events (desktop)
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftStart.current = rowRef.current.scrollLeft;
    setDragCursor('cursor-grabbing');
  };
  const handleMouseLeave = () => { isDragging.current = false; setDragCursor('cursor-grab'); };
  const handleMouseUp = () => { isDragging.current = false; setDragCursor('cursor-grab'); };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    rowRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  // Touch events (mobile - adds momentum feel)
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].pageX;
    touchScrollLeft.current = rowRef.current.scrollLeft;
  };
  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX;
    const walk = (touchStartX.current - x) * 1.2;
    rowRef.current.scrollLeft = touchScrollLeft.current + walk;
  };

  useEffect(() => {
    tmdbApi.getTrending('day').then(data => {
      if (data.results) {
        setTrendingMovies(data.results.slice(0, 10));
      }
    });

    // Fetch Pick of the Day
    getPickOfTheDay().then(pick => {
      if (pick) setPickOfDay(pick);
    });

    // GSAP Hero Animation
    gsap.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    if (trendingMovies.length > 0 && rowRef.current) {
      // GSAP Horizontal Row Reveal
      gsap.fromTo(rowRef.current.children,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: rowRef.current } }
      );
    }
  }, [trendingMovies]);

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative h-125 md:h-150 flex items-center justify-center overflow-hidden rounded-3xl mx-4 mt-4 md:mt-0 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-brand-deep-purple/80 via-brand-coral-pink/60 to-brand-amber-yellow/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#151218]/90"></div>
        </div>
        
        <div ref={heroRef} className="relative z-10 w-full max-w-4xl px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
            Discover Your Next <br/> Cinematic Journey
          </h1>
          <form onSubmit={(e) => { e.preventDefault(); if (heroSearch.trim()) navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`); }} className="relative max-w-2xl mx-auto mt-10 glass-panel rounded-full p-2 flex items-center shadow-2xl">
            <span className="material-symbols-outlined text-white/80 ml-4 text-2xl">search</span>
            <input 
              type="text" 
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search for movies, TV shows, actors..." 
              className="bg-transparent border-none w-full py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-0 text-lg"
            />
            <button type="submit" className="bg-brand-deep-purple text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-pink-purple transition-colors ml-2 hidden sm:block">
              Explore
            </button>
          </form>
        </div>
      </section>

      {/* Trending Today */}
      <section className="mt-16">
        <div className="flex items-end justify-between mb-8 px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Trending Today</h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <button onClick={() => scrollRow('left')} className="glass-panel w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-deep-purple hover:text-white transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => scrollRow('right')} className="glass-panel w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-deep-purple hover:text-white transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <Link to="/trending" className="text-brand-deep-purple dark:text-brand-coral-pink hover:underline flex items-center gap-1 font-semibold text-sm group">
              See All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div 
          ref={rowRef} 
          className={`flex overflow-x-auto gap-3 pb-6 px-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none ${dragCursor}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {trendingMovies.map(movie => (
            <MovieCard 
              key={movie.id} 
              id={movie.id}
              title={movie.title || movie.name}
              year={movie.release_date?.substring(0, 4) || movie.first_air_date?.substring(0, 4)}
              genre=""
              rating={movie.vote_average?.toFixed(1)}
              imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : movie.fallbackImage || 'https://via.placeholder.com/500x750?text=No+Poster'}
            />
          ))}
        </div>
      </section>

      {/* Pick of the Day */}
      {pickOfDay && (
        <section className="mt-16 px-4">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-brand-amber-yellow text-3xl">auto_awesome</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Pick of the Day</h2>
            <span className="glass-panel text-xs font-bold px-3 py-1 rounded-full text-brand-coral-pink">AI Curated</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <div className="flex flex-col md:flex-row">
              {/* Poster */}
              <div className="w-full md:w-70 shrink-0">
                <ImageWithFallback
                  src={pickOfDay.poster}
                  alt={pickOfDay.title}
                  className="w-full h-100 md:h-full object-cover"
                />
              </div>
              {/* Details */}
              <div className="flex-1 glass-panel p-8 md:p-10 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-brand-deep-purple/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pickOfDay.type === 'series' ? '📺 Web Series' : '🎬 Movie'}
                  </span>
                  <span className="text-brand-amber-yellow font-bold text-sm flex items-center gap-1">
                    ★ {pickOfDay.rating}
                  </span>
                  <span className="text-gray-400 text-sm">{pickOfDay.year}</span>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-400 text-sm">{pickOfDay.runtime}</span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {pickOfDay.title}
                </h3>
                <p className="text-brand-coral-pink font-semibold italic text-lg mb-4">
                  "{pickOfDay.tagline}"
                </p>
                <p className="text-gray-600 dark:text-gray-300 font-body leading-relaxed mb-4 max-w-2xl">
                  {pickOfDay.plot}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Director: <span className="text-gray-900 dark:text-white">{pickOfDay.director}</span></span>
                  <span>•</span>
                  <span className="font-semibold">Genre: <span className="text-gray-900 dark:text-white">{pickOfDay.genre}</span></span>
                </div>
                <p className="mt-6 text-sm text-brand-deep-purple dark:text-brand-coral-pink font-semibold">
                  🧠 Why watch today: <span className="font-normal text-gray-600 dark:text-gray-300">{pickOfDay.whyWatch}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Genre Pills Section */}
      <section className="py-8 px-4 mt-8">
        <h2 className="font-display text-2xl font-bold mb-6">Explore by Genre</h2>
        <div className="flex flex-wrap gap-4">
          {genres.map(genre => (
            <button 
              key={genre} 
              onClick={() => navigate(`/search?genre=${encodeURIComponent(genre)}`)}
              className="glass-panel px-6 py-3 rounded-full text-gray-900 dark:text-gray-100 hover:bg-linear-to-r hover:from-brand-deep-purple hover:to-brand-coral-pink hover:text-white hover:border-transparent transition-all duration-300 font-semibold text-sm active:scale-95"
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Top Rated Bento Grid */}
      <section className="mt-16 px-4">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Top Rated Masterpieces</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-150">
          {/* Main Feature */}
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer h-100 md:h-full shadow-xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200"
              alt="Main Movie"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex gap-2 mb-3">
                <span className="bg-brand-deep-purple/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">Critically Acclaimed</span>
                <span className="glass-panel text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><span className="text-brand-amber-yellow text-[10px]">★</span> 9.8</span>
              </div>
              <h3 className="font-display text-3xl md:text-5xl font-bold text-white mb-2 group-hover:text-brand-coral-pink transition-colors">The Crimson Peak</h3>
              <p className="text-white/80 font-body max-w-md line-clamp-2">An epic tale of vengeance and honor set against the backdrop of a crumbling empire. Winner of 5 Academy Awards.</p>
            </div>
          </div>
          
          {/* Side Stack */}
          <div className="flex flex-col gap-6 h-full">
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1 h-62.5 md:h-auto shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800"
                alt="Side Movie 1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-5">
                <h4 className="font-display text-xl font-bold text-white mb-1 group-hover:text-brand-deep-purple transition-colors">Whispering Pines</h4>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <span>2022</span><span>•</span><span className="text-brand-amber-yellow">★ 8.9</span>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1 h-62.5 md:h-auto shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&q=80&w=800"
                alt="Side Movie 2"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-5">
                <h4 className="font-display text-xl font-bold text-white mb-1 group-hover:text-brand-deep-purple transition-colors">Neon Fist</h4>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <span>2023</span><span>•</span><span className="text-brand-amber-yellow">★ 9.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
