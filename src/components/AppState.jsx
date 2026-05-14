import { Link } from 'react-router-dom';

const toneClasses = {
  default: {
    icon: 'text-brand-deep-purple',
    glow: 'from-brand-deep-purple/20 via-brand-coral-pink/10 to-transparent',
    button: 'bg-brand-deep-purple hover:bg-brand-pink-purple'
  },
  danger: {
    icon: 'text-brand-coral-pink',
    glow: 'from-brand-coral-pink/20 via-brand-peach-orange/10 to-transparent',
    button: 'bg-brand-coral-pink hover:bg-brand-pink-purple'
  },
  warm: {
    icon: 'text-brand-amber-yellow',
    glow: 'from-brand-amber-yellow/20 via-brand-coral-pink/10 to-transparent',
    button: 'bg-brand-deep-purple hover:bg-brand-pink-purple'
  },
  success: {
    icon: 'text-brand-lime-yellow',
    glow: 'from-brand-lime-yellow/20 via-brand-deep-purple/10 to-transparent',
    button: 'bg-brand-deep-purple hover:bg-brand-pink-purple'
  }
};

export function StateCard({
  icon = 'movie',
  eyebrow,
  title,
  message,
  tone = 'default',
  actionLabel,
  actionTo,
  onAction,
  className = ''
}) {
  const style = toneClasses[tone] || toneClasses.default;

  const action = actionLabel && (
    actionTo ? (
      <Link
        to={actionTo}
        className={`min-h-11 px-5 rounded-xl text-white font-bold inline-flex items-center justify-center transition-colors ${style.button}`}
      >
        {actionLabel}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onAction}
        className={`min-h-11 px-5 rounded-xl text-white font-bold inline-flex items-center justify-center transition-colors ${style.button}`}
      >
        {actionLabel}
      </button>
    )
  );

  return (
    <div className={`relative overflow-hidden glass-panel rounded-2xl p-6 md:p-8 text-center ${className}`}>
      <div className={`absolute inset-0 bg-linear-to-br ${style.glow}`}></div>
      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/20 flex items-center justify-center mb-4 shadow-lg">
          <span className={`material-symbols-outlined text-3xl ${style.icon}`}>{icon}</span>
        </div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wider text-brand-coral-pink mb-2">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        {message && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ title = 'Loading', message = 'Preparing the next scene...', className = '' }) {
  return (
    <div className={`glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-64 text-center ${className}`}>
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-brand-coral-pink/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-coral-pink border-r-brand-amber-yellow animate-spin"></div>
        <div className="absolute inset-4 rounded-full bg-brand-deep-purple/20"></div>
      </div>
      <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
    </div>
  );
}

export function EmptyState(props) {
  return <StateCard icon="search_off" tone="default" {...props} />;
}

export function ErrorState(props) {
  return <StateCard icon="error" tone="danger" eyebrow="Something went off-script" {...props} />;
}

export function InlineNotice({ icon = 'info', tone = 'default', title, message, actionLabel, actionTo, onAction }) {
  const style = toneClasses[tone] || toneClasses.default;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
        <span className={`material-symbols-outlined ${style.icon}`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-display font-bold text-gray-900 dark:text-white">{title}</h3>}
        {message && <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
      </div>
      {actionLabel && (
        actionTo ? (
          <Link to={actionTo} className={`min-h-10 px-4 rounded-lg text-white text-sm font-bold inline-flex items-center justify-center ${style.button}`}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={`min-h-10 px-4 rounded-lg text-white text-sm font-bold inline-flex items-center justify-center ${style.button}`}>
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
