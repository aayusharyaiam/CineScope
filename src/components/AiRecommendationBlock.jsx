import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRecommendations } from '../services/aiRecommendations';
import { InlineNotice } from './AppState';
import MovieCard from './MovieCard';

export default function AiRecommendationBlock({ title, mediaType = 'movie' }) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !title) return;

    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return getUserRecommendations(currentUser.uid, {
          contextTitle: title,
          limit: 6
        });
      })
      .then(nextItems => {
        if (!cancelled) setItems(nextItems);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentUser, title]);

  if (!currentUser) {
    return (
      <section className="mt-12">
        <div className="glass-panel rounded-2xl p-6 md:p-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-r from-brand-deep-purple/20 via-brand-coral-pink/10 to-brand-amber-yellow/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-brand-coral-pink text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                CineBrain recommendations
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Love {title}?</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                Sign up free to get personalized picks tailored to your favorites, ratings, and watch history.
              </p>
            </div>
            <Link
              to="/auth"
              className="min-h-11 px-6 rounded-xl bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white font-bold inline-flex items-center justify-center"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-coral-pink text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            CineBrain
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Because you liked {title}</h2>
        </div>
        <Link to="/onboarding" className="text-sm font-semibold text-brand-coral-pink hover:underline">
          Tune
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="w-50 min-w-50">
              <div className="aspect-2/3 rounded-xl bg-white/10 animate-pulse mb-2"></div>
              <div className="h-4 rounded bg-white/10 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-3 pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {items.length > 0 ? items.map(item => (
            <div key={`${item.mediaType}_${item.id}`} className="relative">
              <MovieCard
                id={item.id}
                title={item.title}
                year={item.year}
                rating={item.rating}
                imageUrl={item.imageUrl}
                mediaType={item.mediaType || mediaType}
              />
              <p className="w-50 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
                {item.reason}
              </p>
            </div>
          )) : (
            <InlineNotice
              icon="auto_awesome"
              title="CineBrain needs more signal"
              message="Add favorites, ratings, or watch history to unlock stronger recommendations."
              actionLabel="Tune taste"
              actionTo="/onboarding"
            />
          )}
        </div>
      )}
    </section>
  );
}
