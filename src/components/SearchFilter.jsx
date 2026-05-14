export default function SearchFilter({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full max-w-md mb-10">
      <div className="glass-panel rounded-full flex items-center px-5 py-3 border border-gray-200 dark:border-white/10 focus-within:border-brand-deep-purple dark:focus-within:border-brand-primary transition-colors shadow-md">
        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 mr-3 text-xl">search</span>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none w-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 font-body text-sm"
        />
        {value && (
          <button 
            onClick={() => onChange('')} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors ml-2"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    </div>
  );
}
