import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ImageWithFallback from './ImageWithFallback';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tvDropdownOpen, setTvDropdownOpen] = useState(false);
  const [mobileTvOpen, setMobileTvOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [ripple, setRipple] = useState({ active: false, x: 0, y: 0 });

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setMobileTvOpen(false);
  }, [location.pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTvDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ active: true, x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple({ active: false, x: 0, y: 0 }), 600);
  };

  const linkBase = "text-gray-600 dark:text-gray-300 hover:text-brand-deep-purple dark:hover:text-white transition-colors font-body";

  return (
    <>
      <nav className="bg-white/80 dark:bg-[#151218]/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 shadow-2xl fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 lg:px-20 h-16 md:h-20 transition-colors duration-300">
        <Link to="/" className="font-display text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink">
          CineScope
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link to="/" className={linkBase}>Movies</Link>
          
          {/* TV Shows with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setTvDropdownOpen(!tvDropdownOpen)}
              className={`${linkBase} flex items-center gap-1`}
            >
              TV Shows
              <span className={`material-symbols-outlined text-[16px] transition-transform ${tvDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            
            {tvDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white/95 dark:bg-[#1e1a22]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <Link to="/shows" className="block px-5 py-2.5 text-sm font-body text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 hover:text-brand-deep-purple dark:hover:text-white transition-colors">
                  All Shows
                </Link>
                <Link to="/shows/new" className="block px-5 py-2.5 text-sm font-body text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 hover:text-brand-deep-purple dark:hover:text-white transition-colors">
                  🆕 New &amp; Airing Today
                </Link>
                <Link to="/shows/top" className="block px-5 py-2.5 text-sm font-body text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 hover:text-brand-deep-purple dark:hover:text-white transition-colors">
                  ⭐ Top Rated
                </Link>
              </div>
            )}
          </div>

          <Link to="/actors" className={linkBase}>Actors</Link>
          <Link to="/profile" className={linkBase}>Watchlist</Link>
        </div>
        
        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/search" className="text-gray-600 dark:text-gray-400 hover:text-brand-deep-purple dark:hover:text-white transition-colors mr-2">
            <span className="material-symbols-outlined text-2xl">search</span>
          </Link>
          <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-400 hover:text-brand-deep-purple dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-white/20 mx-2"></div>
          
          {currentUser ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-brand-deep-purple dark:hover:text-brand-coral-pink transition-colors font-semibold text-sm">
                <div className="w-8 h-8 rounded-full bg-brand-deep-purple/20 flex items-center justify-center overflow-hidden border border-brand-primary/30">
                  {currentUser.photoURL ? (
                    <ImageWithFallback src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-brand-deep-purple dark:text-brand-primary">person</span>
                  )}
                </div>
                <span className="hidden lg:inline">{currentUser.displayName || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors" title="Log Out">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth" className="text-gray-900 dark:text-white hover:text-brand-deep-purple dark:hover:text-brand-coral-pink transition-colors font-semibold text-sm">Login</Link>
              <Link to="/auth" onClick={handleRipple} className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white px-5 py-2 rounded-full font-semibold text-sm shadow-[0_0_15px_rgba(255,111,145,0.4)] hover:shadow-[0_0_25px_rgba(255,111,145,0.6)] transition-all relative overflow-hidden">
                Sign Up
                {ripple.active && (
                  <span className="absolute rounded-full bg-white/30 animate-ping" style={{ left: ripple.x - 10, top: ripple.y - 10, width: 20, height: 20 }} />
                )}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={toggleTheme} className="text-gray-900 dark:text-gray-100">
            <span className="material-symbols-outlined text-2xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-900 dark:text-gray-100">
            <span className="material-symbols-outlined text-2xl">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          
          {/* Drawer */}
          <div className="absolute top-16 right-0 w-72 max-h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#151218]/95 backdrop-blur-xl border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-6 flex flex-col gap-1">
              <Link to="/" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">movie</span> Movies
              </Link>

              {/* TV Shows accordion */}
              <div>
                <button 
                  onClick={() => setMobileTvOpen(!mobileTvOpen)} 
                  className="w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">live_tv</span> TV Shows
                  </span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${mobileTvOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {mobileTvOpen && (
                  <div className="ml-10 flex flex-col gap-1 mt-1">
                    <Link to="/shows" className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-brand-deep-purple/10 hover:text-brand-deep-purple dark:hover:text-white transition-colors">All Shows</Link>
                    <Link to="/shows/new" className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-brand-deep-purple/10 hover:text-brand-deep-purple dark:hover:text-white transition-colors">🆕 New &amp; Airing</Link>
                    <Link to="/shows/top" className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-brand-deep-purple/10 hover:text-brand-deep-purple dark:hover:text-white transition-colors">⭐ Top Rated</Link>
                  </div>
                )}
              </div>

              <Link to="/actors" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">person</span> Actors
              </Link>
              <Link to="/search" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">search</span> Search
              </Link>
              <Link to="/profile" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">bookmark</span> Watchlist
              </Link>

              <div className="h-px bg-gray-200 dark:bg-white/10 my-3"></div>

              {currentUser ? (
                <div className="flex flex-col gap-1">
                  <Link to="/profile" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-deep-purple/20 flex items-center justify-center overflow-hidden border border-brand-primary/30">
                      {currentUser.photoURL ? (
                        <ImageWithFallback src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[16px] text-brand-deep-purple dark:text-brand-primary">person</span>
                      )}
                    </div>
                    {currentUser.displayName || 'Profile'}
                  </Link>
                  <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 font-body font-semibold transition-colors flex items-center gap-3 text-left">
                    <span className="material-symbols-outlined text-xl">logout</span> Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/auth" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-deep-purple/10 font-body font-semibold transition-colors text-center">Login</Link>
                  <Link to="/auth" className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white px-5 py-3 rounded-xl font-semibold text-sm text-center shadow-lg">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
