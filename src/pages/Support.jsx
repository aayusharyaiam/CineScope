import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSupportRequest, getRecentWebsiteReviews, getWebsiteReview, saveWebsiteReview } from '../services/websiteFeedback';
import { InlineNotice } from '../components/AppState';

const supportTopics = [
  {
    icon: 'lock',
    title: 'Account access',
    text: 'Email verification, sign-in issues, and profile setup help.'
  },
  {
    icon: 'movie',
    title: 'Catalog issues',
    text: 'Missing posters, incorrect titles, ratings, cast, or show details.'
  },
  {
    icon: 'psychology',
    title: 'CineBrain',
    text: 'Recommendation tuning, onboarding preferences, and AI picks.'
  }
];

export default function Support() {
  const { currentUser } = useAuth();
  const [topic, setTopic] = useState('Account access');
  const [message, setMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [recentReviews, setRecentReviews] = useState([]);
  const [savingRequest, setSavingRequest] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getRecentWebsiteReviews().then(items => {
      if (!cancelled) setRecentReviews(items);
    });

    return () => {
      cancelled = true;
    };
  }, [reviewStatus]);

  useEffect(() => {
    if (!currentUser) return;

    getWebsiteReview(currentUser.uid).then(existing => {
      if (existing) {
        setReviewRating(existing.rating || 0);
        setReview(existing.review || '');
      }
    });
  }, [currentUser]);

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    setRequestStatus('');

    if (!message.trim()) {
      setRequestStatus('Tell us what happened so we can help.');
      return;
    }

    setSavingRequest(true);
    const ok = await createSupportRequest(currentUser, { topic, message });
    setSavingRequest(false);

    if (ok) {
      setMessage('');
      setRequestStatus('Support request saved.');
    } else {
      setRequestStatus('Could not save your request right now.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewStatus('');

    if (!currentUser) {
      setReviewStatus('Sign in to add a website review.');
      return;
    }

    if (!reviewRating) {
      setReviewStatus('Choose a star rating first.');
      return;
    }

    setSavingReview(true);
    const ok = await saveWebsiteReview(currentUser, {
      rating: reviewRating,
      review,
      trigger: 'support_page'
    });
    setSavingReview(false);
    setReviewStatus(ok ? 'Website review saved.' : 'Could not save your review right now.');
  };

  return (
    <div className="min-h-screen px-4 md:px-8 pb-20 pt-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coral-pink/10 text-brand-coral-pink text-xs font-bold uppercase tracking-wider mb-5">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              Support
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
              Tell us what needs attention.
            </h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Get help with your account, catalog data, watchlist, and CineBrain recommendations. You can also leave a public website review here.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {supportTopics.map(item => (
              <div key={item.title} className="glass-panel rounded-xl p-5">
                <span className="material-symbols-outlined text-3xl text-brand-coral-pink mb-3 block">{item.icon}</span>
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSupportSubmit} className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Contact support</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Saved to Firestore so the team can follow up.</p>
            </div>

            {!currentUser && (
              <InlineNotice
                icon="person"
                tone="warm"
                title="Sign in for account-specific help"
                message="Guest messages can still be saved, but signing in attaches your account details."
                actionLabel="Sign in"
                actionTo="/auth"
              />
            )}

            <label className="block">
              <span className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Topic</span>
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/20 px-4 py-3 outline-none focus:border-brand-coral-pink text-gray-900 dark:text-white"
              >
                {supportTopics.map(item => (
                  <option key={item.title}>{item.title}</option>
                ))}
                <option>Website feedback</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={7}
                maxLength={2000}
                placeholder="Describe the issue or request..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4 outline-none focus:border-brand-coral-pink resize-none text-gray-900 dark:text-white"
              ></textarea>
            </label>

            {requestStatus && <p className="text-sm font-semibold text-brand-coral-pink">{requestStatus}</p>}

            <button
              type="submit"
              disabled={savingRequest}
              className="min-h-11 w-full rounded-xl bg-brand-deep-purple text-white font-bold disabled:opacity-60"
            >
              {savingRequest ? 'Sending...' : 'Send support request'}
            </button>
          </form>

          <form onSubmit={handleReviewSubmit} className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Review the website</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Rate CineScope and share what would make it better.</p>
            </div>

            {!currentUser && (
              <InlineNotice
                icon="lock"
                tone="danger"
                title="Sign in required"
                message="Website reviews are tied to your CineScope account."
                actionLabel="Sign in"
                actionTo="/auth"
              />
            )}

            <div className="flex gap-2" aria-label="Website rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} out of 5`}
                  disabled={!currentUser}
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{
                      fontVariationSettings: (hoverRating || reviewRating) >= star ? "'FILL' 1" : "'FILL' 0",
                      color: (hoverRating || reviewRating) >= star ? '#ffc75f' : '#777'
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
              rows={7}
              maxLength={1200}
              placeholder="Your website review..."
              disabled={!currentUser}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4 outline-none focus:border-brand-coral-pink resize-none text-gray-900 dark:text-white disabled:opacity-60"
            ></textarea>

            {reviewStatus && <p className="text-sm font-semibold text-brand-coral-pink">{reviewStatus}</p>}

            <button
              type="submit"
              disabled={savingReview || !currentUser}
              className="min-h-11 w-full rounded-xl bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white font-bold disabled:opacity-60"
            >
              {savingReview ? 'Saving...' : 'Save website review'}
            </button>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Recent website reviews</h2>
            <Link to="/auth" className="text-sm font-semibold text-brand-coral-pink hover:underline">
              Join CineScope
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-gray-600 dark:text-gray-300">
              No website reviews yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentReviews.map(item => (
                <article key={item.id} className="glass-panel rounded-xl p-5">
                  <div className="flex items-center gap-1 text-brand-amber-yellow mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: (item.rating || 0) >= star ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{item.review || 'No written review added.'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 font-semibold">
                    {item.displayName || item.email?.split('@')[0] || 'CineScope user'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
