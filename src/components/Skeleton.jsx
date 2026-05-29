import React from 'react';

export function CardSkeleton({ count = 6, fluid = false }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`${fluid ? 'w-full aspect-[2/3]' : 'w-[200px] aspect-[2/3]'} bg-white/5 rounded-xl mb-3`} />
          <div className="h-3 w-3/4 bg-white/5 rounded-full mb-2" />
          <div className="h-2 w-1/2 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse px-4 md:px-20 pt-[300px] md:pt-[400px] max-w-[1440px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
        <div className="w-48 md:w-64 lg:w-80 aspect-[2/3] bg-white/5 rounded-xl shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="h-10 w-3/4 bg-white/5 rounded-lg" />
          <div className="h-4 w-1/3 bg-white/5 rounded-full" />
          <div className="h-4 w-1/4 bg-white/5 rounded-full" />
          <div className="h-20 w-full bg-white/5 rounded-lg" />
          <div className="h-12 w-40 bg-white/5 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-36 shrink-0">
            <div className="w-36 h-48 bg-white/5 rounded-2xl mb-3" />
            <div className="h-3 w-3/4 bg-white/5 rounded-full mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActorDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="rounded-[2rem] overflow-hidden bg-white/5 p-8 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-white/10 mb-6" />
            <div className="h-6 w-32 bg-white/10 rounded-lg mb-2" />
            <div className="h-4 w-20 bg-white/10 rounded-full mb-8" />
            <div className="h-32 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
        <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="aspect-[2/3] bg-white/5 rounded-xl mb-3" />
                <div className="h-3 w-3/4 bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 px-4 md:px-8 max-w-[1440px] mx-auto">
      <div className="lg:col-span-4 space-y-8">
        <div className="rounded-xl bg-white/5 p-8 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-white/10 mb-4" />
          <div className="h-6 w-40 bg-white/10 rounded-lg mb-1" />
          <div className="h-4 w-24 bg-white/10 rounded-full mb-6" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-8">
        <div className="flex gap-8 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-24 bg-white/5 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="animate-pulse min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[440px] bg-white/5 rounded-2xl p-10 space-y-6">
        <div className="h-10 w-48 bg-white/10 rounded-lg mx-auto" />
        <div className="h-12 w-full bg-white/5 rounded-full" />
        <div className="space-y-4">
          <div className="h-14 w-full bg-white/5 rounded-xl" />
          <div className="h-14 w-full bg-white/5 rounded-xl" />
        </div>
        <div className="h-14 w-full bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
