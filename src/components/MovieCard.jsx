import { useState } from 'react';
import { Link } from 'react-router-dom';

const fallbackPoster = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="%23845ec2"/><stop offset=".55" stop-color="%23ff6f91"/><stop offset="1" stop-color="%23ffc75f"/></linearGradient></defs><rect width="500" height="750" fill="%23151218"/><rect x="28" y="28" width="444" height="694" rx="28" fill="url(%23g)" opacity=".28"/><circle cx="250" cy="330" r="70" fill="%23ffffff" opacity=".15"/><path d="M220 280l90 50-90 50z" fill="%23ffffff" opacity=".55"/><text x="250" y="455" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="%23ffffff" opacity=".75">CineScope</text><text x="250" y="495" text-anchor="middle" font-family="Arial" font-size="18" fill="%23ffffff" opacity=".55">Poster unavailable</text></svg>';

export default function MovieCard({ id, title, year, genre, rating, imageUrl, mediaType = 'movie' }) {
  const [src, setSrc] = useState(imageUrl || fallbackPoster);
  const linkPath = mediaType === 'tv' ? `/show/${id}` : `/movie/${id}`;

  return (
    <Link to={linkPath} style={{ width: '200px', minWidth: '200px' }} className="flex-shrink-0 group cursor-pointer snap-start block">
      <div className="relative rounded-xl overflow-hidden aspect-2/3 mb-2 shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(132,94,194,0.3)] bg-[#151218]">
        <img
          src={src}
          alt={title || 'Untitled'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setSrc(fallbackPoster)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-1 right-1 glass-panel rounded px-1 py-0.5 flex items-center gap-0.5 text-[10px] font-bold text-white shadow-md">
          <span className="material-symbols-outlined text-brand-amber-yellow text-[10px]">star</span> {rating || 'NR'}
        </div>
      </div>
      <h3 className="font-display text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-deep-purple transition-colors">
        {title || 'Untitled'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 font-body text-[10px]">
        {year || 'N/A'} {genre ? `- ${genre}` : ''}
      </p>
    </Link>
  );
}
