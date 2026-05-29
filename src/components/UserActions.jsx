import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { getUserMediaEntry, setUserMediaEntry, removeUserMediaEntry } from '../services/userMedia';

export default function UserActions({ mediaType, mediaId, title, posterUrl }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoadingData(false);
      return;
    }
    
    setLoadingData(true);
    const safeMediaId = String(mediaId).trim();
    
    getUserMediaEntry(currentUser.uid, mediaType, safeMediaId).then(data => {
      if (data) {
        setEntry(data);
      } else {
        setEntry(null);
      }
      setLoadingData(false);
    }).catch(err => {
      console.error(err);
      setEntry(null);
      setLoadingData(false);
    });
  }, [currentUser, mediaType, mediaId]);

  const requireAuth = () => {
    if (!currentUser) {
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  const handleWatchlist = async () => {
    if (!requireAuth()) return;

    if (entry?.status === 'watchlist') {
      setEntry(null);
      addToast('Removed from Watchlist');
      removeUserMediaEntry(currentUser.uid, mediaType, mediaId);
    } else {
      const newEntry = { title, posterUrl, status: 'watchlist', addedAt: entry?.addedAt || Date.now(), rating: entry?.rating || 0 };
      setEntry(prev => ({ ...prev, ...newEntry }));
      addToast('Added to Watchlist');
      setUserMediaEntry(currentUser.uid, mediaType, mediaId, newEntry);
    }
  };

  const handleFavoriteClick = () => {
    if (!requireAuth()) return;

    const isFav = entry?.isFavorite === true;
    const newEntry = { 
      title, 
      posterUrl, 
      isFavorite: !isFav,
      addedAt: entry?.addedAt || Date.now(), 
      rating: entry?.rating || 0,
      status: entry?.status || 'unwatched'
    };
    
    setEntry(prev => ({ ...prev, ...newEntry }));
    addToast(!isFav ? 'Added to Favorites' : 'Removed from Favorites', 'favorite');
    setUserMediaEntry(currentUser.uid, mediaType, safeMediaId, newEntry);
  };

  const handleWatchedClick = () => {
    if (!requireAuth()) return;

    if (entry?.status === 'watched') {
      // Already watched — revert to watchlist
      revertToWatchlist();
    } else {
      // Not watched yet — open rating popup
      setSelectedRating(entry?.rating || 0);
      setShowRatingPopup(true);
    }
  };

  const revertToWatchlist = async () => {
    const newEntry = { ...entry, status: 'watchlist', rating: 0 };
    setEntry(newEntry);
    addToast('Moved back to Watchlist');
    setUserMediaEntry(currentUser.uid, mediaType, mediaId, newEntry);
  };

  const submitRating = async () => {
    const newEntry = {
      title, posterUrl,
      status: 'watched',
      addedAt: entry?.addedAt || Date.now(),
      rating: selectedRating
    };
    
    // Optimistic UI Update
    setEntry(prev => ({ ...prev, ...newEntry }));
    setShowRatingPopup(false);
    addToast('Rating saved successfully!');
    
    // Background save
    setUserMediaEntry(currentUser.uid, mediaType, mediaId, newEntry);
  };

  const skipRating = async () => {
    const newEntry = {
      title, posterUrl,
      status: 'watched',
      addedAt: entry?.addedAt || Date.now(),
      rating: 0
    };
    
    // Optimistic UI Update
    setEntry(prev => ({ ...prev, ...newEntry }));
    setShowRatingPopup(false);
    addToast('Marked as watched!');
    
    // Background save
    setUserMediaEntry(currentUser.uid, mediaType, mediaId, newEntry);
  };

  const isInWatchlist = entry?.status === 'watchlist';
  const isWatched = entry?.status === 'watched';
  const isFavorite = entry?.isFavorite === true;
  const userRating = entry?.rating || 0;
  const safeMediaId = String(mediaId).trim();

  return (
    <>
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-coral-pink">bookmark</span>
          Your Activity
        </h3>

        {loadingData ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-full bg-white/10 rounded-xl"></div>
            <div className="h-12 w-full bg-white/10 rounded-xl"></div>
          </div>
        ) : (
          <>
            {/* Watchlist Button */}
        <button 
          onClick={handleWatchlist}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
            isInWatchlist 
              ? 'bg-brand-deep-purple text-white shadow-[0_0_20px_rgba(132,94,194,0.3)]' 
              : 'border border-white/20 hover:bg-white/10 text-white'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isInWatchlist ? "'FILL' 1" : "'FILL' 0" }}>
            bookmark
          </span>
          {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </button>

        {/* Watched Button */}
        <button 
          onClick={handleWatchedClick}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
            isWatched 
              ? 'bg-brand-lime-yellow/20 text-brand-lime-yellow border border-brand-lime-yellow/40' 
              : 'border border-white/20 hover:bg-white/10 text-white'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isWatched ? "'FILL' 1" : "'FILL' 0" }}>
            {isWatched ? 'check_circle' : 'visibility'}
          </span>
          {isWatched ? 'Watched ✓' : 'Mark as Watched'}
        </button>

        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          disabled={loadingData}
          className={`w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
            isFavorite 
              ? 'bg-brand-coral-pink/20 text-brand-coral-pink border border-brand-coral-pink/40 shadow-[0_0_15px_rgba(255,111,145,0.2)]' 
              : 'border border-white/20 hover:bg-white/10 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
          {isFavorite ? 'Favorited ❤️' : 'Add to Favorites'}
        </button>

            {/* Show existing rating if watched */}
            {isWatched && userRating > 0 && (
              <div className="flex items-center justify-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    className="material-symbols-outlined text-xl"
                    style={{ 
                      fontVariationSettings: userRating >= star ? "'FILL' 1" : "'FILL' 0",
                      color: userRating >= star ? '#ffd166' : '#555'
                    }}
                  >star</span>
                ))}
                <span className="text-xs text-gray-400 ml-2">Your rating: {userRating}/5</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating Popup — appears when marking as watched */}
      {showRatingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRatingPopup(false)}></div>
          <div className="relative bg-[#1a1625] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-brand-amber-yellow mb-3 block">star</span>
            <h3 className="font-display text-2xl font-bold text-white mb-1">Rate This {mediaType === 'tv' ? 'Show' : 'Movie'}</h3>
            <p className="text-gray-400 text-sm mb-6">How would you rate <span className="text-white font-semibold">{title}</span>?</p>
            
            {/* 5-Star Picker */}
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125 active:scale-95"
                >
                  <span 
                    className="material-symbols-outlined text-4xl"
                    style={{ 
                      fontVariationSettings: (hoverRating || selectedRating) >= star ? "'FILL' 1" : "'FILL' 0",
                      color: (hoverRating || selectedRating) >= star ? '#ffd166' : '#444'
                    }}
                  >star</span>
                </button>
              ))}
            </div>

            {selectedRating > 0 && (
              <p className="text-brand-amber-yellow font-display font-bold text-lg mb-6">{selectedRating} / 5 Stars</p>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={submitRating}
                disabled={selectedRating === 0 || loading}
                className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Submit Rating'}
              </button>
              <button 
                onClick={skipRating}
                disabled={loading}
                className="text-gray-500 hover:text-white transition-colors py-2 text-sm"
              >
                Skip Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthPrompt(false)}></div>
          <div className="relative bg-[#1a1625] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-brand-coral-pink mb-4 block">lock</span>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Sign In Required</h3>
            <p className="text-gray-400 text-sm mb-6">Create an account or log in to add to your watchlist, rate movies, and track your viewing history.</p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all"
              >
                Sign In / Sign Up
              </Link>
              <button 
                onClick={() => setShowAuthPrompt(false)}
                className="text-gray-500 hover:text-white transition-colors py-2 text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
