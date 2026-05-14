import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-[#37333a] border-t border-gray-200 dark:border-white/5 mt-16 pt-16 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-1">
            <div className="font-display text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink mb-4">
              CineScope
            </div>
            <p className="text-gray-500 dark:text-[#ccc3d3] font-body text-sm mb-6">
              Your premium destination for cinematic experiences. Stream the best movies and TV shows in ultra-high definition.
            </p>
          </div>
          
          <div>
            <h4 className="font-display text-lg text-gray-900 dark:text-[#e7e0e9] mb-4 font-semibold">Explore</h4>
            <ul className="space-y-2 text-gray-500 dark:text-[#ccc3d3] font-body text-sm">
              <li><Link to="/" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">Movies</Link></li>
              <li><Link to="/shows" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">TV Shows</Link></li>
              <li><Link to="/shows/new" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">New Releases</Link></li>
              <li><Link to="/shows/top" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">Top Rated</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-lg text-gray-900 dark:text-[#e7e0e9] mb-4 font-semibold">Account</h4>
            <ul className="space-y-2 text-gray-500 dark:text-[#ccc3d3] font-body text-sm">
              <li><Link to="/watchlist" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">My Watchlist</Link></li>
              <li><Link to="/profile" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">Profile</Link></li>
              <li><Link to="/support" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">Support</Link></li>
              <li><Link to="/onboarding" className="hover:text-brand-deep-purple dark:hover:text-[#d5baff] transition-colors">Taste Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-lg text-gray-900 dark:text-[#e7e0e9] mb-4 font-semibold">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-900 dark:text-[#e7e0e9] hover:bg-brand-deep-purple hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-900 dark:text-[#e7e0e9] hover:bg-brand-deep-purple hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
            </div>
          </div>
          
        </div>
        
        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 dark:text-[#ccc3d3] font-body text-xs">
          <p>© 2026 CineScope. Designed & Developed by Aayush.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
