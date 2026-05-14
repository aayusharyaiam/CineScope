import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserMediaEntry, removeUserMediaEntry, setUserMediaEntry } from '../services/userMedia';
import { recordFirstFeedbackPrompt } from '../services/userProfile';
import { requestSiteReviewPrompt } from '../services/siteReviewEvents';

export default function UserActions({ mediaType, mediaId, title, posterUrl }) {
  const { currentUser } = useAuth();
  const safeMediaId = String(mediaId).trim();
  const [entry, setEntry] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!currentUser) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setEntry(null);
          setLoadingData(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoadingData(true);
        return getUserMediaEntry(currentUser.uid, mediaType, safeMediaId);
      })
      .then(data => {
        if (!cancelled) setEntry(data || null);
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser, mediaType, safeMediaId]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const requireAuth = () => {
    if (!currentUser) {
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  const saveEntry = async (data, successMessage) => {
    setSaving(true);
    setEntry(prev => ({ ...prev, ...data }));
    const ok = await setUserMediaEntry(currentUser.uid, mediaType, safeMediaId, data);
    setSaving(false);
    showToast(ok ? successMessage : 'Could not save your activity right now.');
    return ok;
  };

  const handleWatchlist = async () => {
    if (!requireAuth()) return;

    if (entry?.status === 'watchlist') {
      setEntry(null);
      await removeUserMediaEntry(currentUser.uid, mediaType, safeMediaId);
      showToast('Removed from watchlist');
      return;
    }

    await saveEntry({
      title,
      posterUrl,
      status: 'watchlist',
      addedAt: entry?.addedAt || Date.now(),
      rating: entry?.rating || 0,
      review: entry?.review || '',
      isFavorite: Boolean(entry?.isFavorite)
    }, 'Added to watchlist');
  };

  const handleFavoriteClick = async () => {
    if (!requireAuth()) return;

    const isFavorite = entry?.isFavorite === true;
    await saveEntry({
      title,
      posterUrl,
      isFavorite: !isFavorite,
      addedAt: entry?.addedAt || Date.now(),
      rating: entry?.rating || 0,
      review: entry?.review || '',
      status: entry?.status || 'unwatched'
    }, !isFavorite ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleWatchedClick = () => {
    if (!requireAuth()) return;

    if (entry?.status === 'watched') {
      saveEntry({
        title,
        posterUrl,
        status: 'watchlist',
        addedAt: entry?.addedAt || Date.now(),
        rating: entry?.rating || 0,
        review: entry?.review || '',
        isFavorite: Boolean(entry?.isFavorite)
      }, 'Moved back to watchlist');
      return;
    }

    setSelectedRating(entry?.rating || 0);
    setReviewText(entry?.review || '');
    setShowFeedbackPopup(true);
  };

  const submitFeedback = async () => {
    const cleanReview = reviewText.trim();
    const hasFeedback = selectedRating > 0 || cleanReview.length > 0;
    const ok = await saveEntry({
      title,
      posterUrl,
      status: 'watched',
      addedAt: entry?.addedAt || Date.now(),
      rating: selectedRating,
      review: cleanReview,
      isFavorite: Boolean(entry?.isFavorite)
    }, hasFeedback ? 'Feedback saved' : 'Marked as watched');

    setShowFeedbackPopup(false);

    if (ok && hasFeedback) {
      const shouldPrompt = await recordFirstFeedbackPrompt(currentUser.uid);
      if (shouldPrompt) requestSiteReviewPrompt('first_feedback');
    }
  };

  const isInWatchlist = entry?.status === 'watchlist';
  const isWatched = entry?.status === 'watched';
  const isFavorite = entry?.isFavorite === true;
  const userRating = entry?.rating || 0;
  const userReview = entry?.review || '';
  const titleType = mediaType === 'tv' ? 'Show' : 'Movie';

  return (
    <>
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
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
            <button
              type="button"
              onClick={handleWatchlist}
              disabled={saving}
              className={`w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                isInWatchlist
                  ? 'bg-brand-deep-purple text-white shadow-[0_0_20px_rgba(132,94,194,0.3)]'
                  : 'border border-white/20 hover:bg-white/10 text-gray-900 dark:text-white'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isInWatchlist ? "'FILL' 1" : "'FILL' 0" }}>
                bookmark
              </span>
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>

            <button
              type="button"
              onClick={handleWatchedClick}
              disabled={saving}
              className={`w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                isWatched
                  ? 'bg-brand-lime-yellow/20 text-brand-lime-yellow border border-brand-lime-yellow/40'
                  : 'border border-white/20 hover:bg-white/10 text-gray-900 dark:text-white'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isWatched ? "'FILL' 1" : "'FILL' 0" }}>
                {isWatched ? 'check_circle' : 'visibility'}
              </span>
              {isWatched ? 'Watched' : 'Mark as Watched'}
            </button>

            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={saving}
              className={`w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                isFavorite
                  ? 'bg-brand-coral-pink/20 text-brand-coral-pink border border-brand-coral-pink/40 shadow-[0_0_15px_rgba(255,111,145,0.2)]'
                  : 'border border-white/20 hover:bg-white/10 text-gray-900 dark:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>

            {isWatched && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRating(userRating);
                  setReviewText(userReview);
                  setShowFeedbackPopup(true);
                }}
                className="w-full py-3 rounded-xl border border-brand-coral-pink/40 text-brand-coral-pink font-display font-semibold hover:bg-brand-coral-pink/10 transition-colors"
              >
                Edit rating and review
              </button>
            )}

            {isWatched && (userRating > 0 || userReview) && (
              <div className="rounded-xl bg-white/50 dark:bg-white/5 p-4">
                {userRating > 0 && (
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-xl"
                        style={{
                          fontVariationSettings: userRating >= star ? "'FILL' 1" : "'FILL' 0",
                          color: userRating >= star ? '#ffc75f' : '#777'
                        }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{userRating}/5</span>
                  </div>
                )}
                {userReview && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{userReview}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showFeedbackPopup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeedbackPopup(false)}></div>
          <div className="relative bg-white dark:bg-[#1a1625] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-brand-amber-yellow mb-3 block">star</span>
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">Rate This {titleType}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">How did {title} land for you?</p>

            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} out of 5`}
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{
                      fontVariationSettings: (hoverRating || selectedRating) >= star ? "'FILL' 1" : "'FILL' 0",
                      color: (hoverRating || selectedRating) >= star ? '#ffc75f' : '#777'
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Add a quick review..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-coral-pink resize-none"
            ></textarea>

            <div className="flex flex-col gap-3 mt-5">
              <button
                type="button"
                onClick={submitFeedback}
                disabled={saving}
                className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save feedback'}
              </button>
              <button
                type="button"
                onClick={() => setShowFeedbackPopup(false)}
                disabled={saving}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthPrompt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthPrompt(false)}></div>
          <div className="relative bg-white dark:bg-[#1a1625] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-brand-coral-pink mb-4 block">lock</span>
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign In Required</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">Create an account or log in to add to your watchlist, rate titles, and track your viewing history.</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/auth"
                className="bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(132,94,194,0.4)] transition-all"
              >
                Sign In / Sign Up
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthPrompt(false)}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors py-2 text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-brand-deep-purple/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(132,94,194,0.3)] font-body text-sm font-semibold flex items-center gap-2 border border-white/10">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}
