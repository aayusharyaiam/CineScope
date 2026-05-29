import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

export default function MovieCard({ id, title, year, genre, rating, imageUrl, mediaType = 'movie', fluid = false }) {
  const linkPath = mediaType === 'tv' ? `/show/${id}` : `/movie/${id}`;
  return (
    <Link 
      to={linkPath} 
      style={fluid ? {} : { width: '200px', minWidth: '200px' }} 
      className={`${fluid ? 'w-full' : 'w-[200px] shrink-0'} group cursor-pointer snap-start block`}
    >
      <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-2 shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(132,94,194,0.3)]">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          fallbackIndex={id}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-1 right-1 glass-panel rounded px-1 py-0.5 flex items-center gap-0.5 text-[10px] font-bold text-white shadow-md">
          <span className="text-brand-amber-yellow text-[8px]">★</span> {rating}
        </div>
      </div>
      <h3 className="font-display text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-deep-purple dark:group-hover:text-brand-coral-pink transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 font-body text-[10px]">
        {year} {genre ? `• ${genre}` : ''}
      </p>
    </Link>
  );
}
