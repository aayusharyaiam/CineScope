import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InlineNotice } from './AppState';
import { getWebsiteReview, saveWebsiteReview } from '../services/websiteFeedback';
import { SITE_REVIEW_PROMPT_EVENT } from '../services/siteReviewEvents';

const promptCopy = {
  signup: {
    icon: 'celebration',
    title: 'Welcome to CineScope',
    message: 'Before you start building your watchlist, tell us how the website feels so far.'
  },
  first_feedback: {
    icon: 'reviews',
    title: 'Thanks for your first feedback',
    message: 'You just helped CineScope learn your taste. Want to rate the website too?'
  },
  manual: {
    icon: 'rate_review',
    title: 'Rate CineScope',
    message: 'Share a quick rating and review for the website.'
  }
};

export default function WebsiteReviewPrompt() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState('manual');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!currentUser) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setOpen(false);
          setHasSubmitted(false);
        }
      });
      return undefined;
    }

    getWebsiteReview(currentUser.uid).then(existing => {
      if (!cancelled) setHasSubmitted(Boolean(existing));
    });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || hasSubmitted || !location.state?.promptSiteReview) return;

    Promise.resolve().then(() => {
      setTrigger(location.state.promptSiteReview);
      setOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    });
  }, [currentUser, hasSubmitted, location.pathname, location.state, navigate]);

  useEffect(() => {
    const handlePrompt = (event) => {
      if (!currentUser || hasSubmitted) return;
      setTrigger(event.detail?.trigger || 'manual');
      setOpen(true);
    };

    window.addEventListener(SITE_REVIEW_PROMPT_EVENT, handlePrompt);
    return () => window.removeEventListener(SITE_REVIEW_PROMPT_EVENT, handlePrompt);
  }, [currentUser, hasSubmitted]);

  if (!open || !currentUser || hasSubmitted) return null;

  const copy = promptCopy[trigger] || promptCopy.manual;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!rating) {
      setError('Pick a star rating to save your review.');
      return;
    }

    setSaving(true);
    const ok = await saveWebsiteReview(currentUser, { rating, review, trigger });
    setSaving(false);

    if (ok) {
      setHasSubmitted(true);
      setOpen(false);
      setRating(0);
      setReview('');
    } else {
      setError('Your review could not be saved right now.');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white dark:bg-[#1a1625] p-6 md:p-8 shadow-2xl text-center">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-300"
          aria-label="Close review prompt"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <span className="material-symbols-outlined text-5xl text-brand-coral-pink mb-3 block">{copy.icon}</span>
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">{copy.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{copy.message}</p>

        <div className="flex justify-center gap-2 mb-5" aria-label="Website rating">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={`Rate ${star} out of 5`}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{
                  fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                  color: (hoverRating || rating) >= star ? '#ffc75f' : '#777'
                }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(event) => setReview(event.target.value)}
          maxLength={1200}
          rows={4}
          placeholder="What should we keep, improve, or fix?"
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-coral-pink resize-none"
        ></textarea>

        {error && (
          <div className="mt-3 text-left">
            <InlineNotice icon="error" tone="danger" title="Review needs attention" message={error} />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-xl bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white font-bold disabled:opacity-60"
          >
            {saving ? 'Saving review...' : 'Submit website review'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-10 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            Maybe later
          </button>
        </div>
      </form>
    </div>
  );
}
