import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-white/90 dark:bg-[#37333a]/90 backdrop-blur-2xl text-brand-deep-purple dark:text-[#d5baff] font-body text-xs shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] fixed bottom-0 left-0 w-full z-50 flex md:hidden justify-around items-center px-4 py-3 pb-safe border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
      
      <Link to="/" className={`flex flex-col items-center justify-center ${currentPath === '/' ? 'bg-brand-deep-purple/10 dark:bg-brand-deep-purple/20 text-brand-deep-purple dark:text-[#d5baff]' : 'text-gray-500 dark:text-[#ccc3d3]'} rounded-full px-5 py-1 transition-all`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="mt-1">Home</span>
      </Link>
      
      <Link to="/search" className={`flex flex-col items-center justify-center ${currentPath === '/search' ? 'bg-brand-deep-purple/10 dark:bg-brand-deep-purple/20 text-brand-deep-purple dark:text-[#d5baff]' : 'text-gray-500 dark:text-[#ccc3d3]'} rounded-full px-5 py-1 transition-all`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/search' ? "'FILL' 1" : "'FILL' 0" }}>search</span>
        <span className="mt-1">Search</span>
      </Link>
      
      <Link to="/watchlist" className={`flex flex-col items-center justify-center ${currentPath === '/watchlist' ? 'bg-brand-deep-purple/10 dark:bg-brand-deep-purple/20 text-brand-deep-purple dark:text-[#d5baff]' : 'text-gray-500 dark:text-[#ccc3d3]'} rounded-full px-5 py-1 transition-all`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/watchlist' ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
        <span className="mt-1">Watchlist</span>
      </Link>
      
      <Link to="/profile" className={`flex flex-col items-center justify-center ${currentPath === '/profile' ? 'bg-brand-deep-purple/10 dark:bg-brand-deep-purple/20 text-brand-deep-purple dark:text-[#d5baff]' : 'text-gray-500 dark:text-[#ccc3d3]'} rounded-full px-5 py-1 transition-all`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
        <span className="mt-1">Profile</span>
      </Link>
      
    </nav>
  );
}
