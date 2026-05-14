import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-20 overflow-hidden bg-white dark:bg-[#151218] text-gray-900 dark:text-[#e7e0e9]">
      {/* Cinematic Blurred Poster Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cover bg-center opacity-10 dark:opacity-30 blur-[60px] transform rotate-12" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80')" }}>
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cover bg-center opacity-15 dark:opacity-40 blur-[80px] transform -rotate-6" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80')" }}>
        </div>
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-white/90 dark:to-[#151218]/90"></div>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 z-20 glass-panel w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-deep-purple hover:text-white transition-colors text-gray-700 dark:text-gray-300"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      {/* Glass Card Container */}
      <div className="relative z-10 w-full max-w-[440px] bg-white/60 dark:bg-[#211e25]/60 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle Glow Effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-br from-brand-deep-purple/10 to-brand-coral-pink/10 dark:from-brand-deep-purple/20 dark:to-brand-coral-pink/20 blur-xl opacity-50 z-[-1]"></div>
        
        <div className="p-8 md:p-10 flex flex-col gap-8">
          {/* Brand Anchor */}
          <div className="text-center">
            <Link to="/" className="font-display text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-deep-purple via-brand-coral-pink to-[#ff9671]">
              CineScope
            </Link>
            <p className="font-body text-gray-500 dark:text-gray-400 mt-2">Your gateway to cinematic worlds.</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex relative rounded-full bg-gray-100 dark:bg-[#37333a]/50 p-1 border border-gray-200 dark:border-white/5 backdrop-blur-md">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-center rounded-full text-sm font-bold transition-all duration-300 ${isLogin ? 'bg-brand-deep-purple text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-center rounded-full text-sm font-bold transition-all duration-300 ${!isLogin ? 'bg-brand-deep-purple text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-body text-center">
                {error}
              </div>
            )}
            <div className="relative group">
              <input 
                id="email" 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full bg-gray-50 dark:bg-[#211e25]/80 border border-gray-300 dark:border-gray-600/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 dark:text-white font-body focus:outline-none focus:border-brand-primary/70 focus:bg-white dark:focus:bg-[#211e25] focus:ring-1 focus:ring-brand-primary/50 peer transition-all duration-300 placeholder-transparent" 
                placeholder="Email Address" 
              />
              <label htmlFor="email" className="absolute left-4 top-4 text-gray-500 dark:text-gray-400 font-body transition-all duration-300 transform -translate-y-2 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-brand-deep-purple dark:peer-focus:text-brand-primary z-10 pointer-events-none">
                Email Address
              </label>
            </div>

            <div className="relative group">
              <input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full bg-gray-50 dark:bg-[#211e25]/80 border border-gray-300 dark:border-gray-600/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 dark:text-white font-body focus:outline-none focus:border-brand-primary/70 focus:bg-white dark:focus:bg-[#211e25] focus:ring-1 focus:ring-brand-primary/50 peer transition-all duration-300 placeholder-transparent" 
                placeholder="Password" 
              />
              <label htmlFor="password" className="absolute left-4 top-4 text-gray-500 dark:text-gray-400 font-body transition-all duration-300 transform -translate-y-2 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-brand-deep-purple dark:peer-focus:text-brand-primary z-10 pointer-events-none">
                Password
              </label>
            </div>

            {isLogin && (
              <div className="flex justify-end mt-[-8px]">
                <a href="#" className="text-xs font-bold text-brand-deep-purple dark:text-brand-primary/80 hover:text-brand-coral-pink dark:hover:text-brand-primary transition-colors">Forgot Password?</a>
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-brand-deep-purple to-brand-coral-pink text-white text-sm font-bold flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(132,94,194,0.3)] group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 tracking-wider uppercase">{loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}</span>
              <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-gray-200 dark:bg-gray-600/40 flex-1"></div>
            <span className="text-gray-400/60 text-xs font-bold uppercase tracking-widest">Or</span>
            <div className="h-px bg-gray-200 dark:bg-gray-600/40 flex-1"></div>
          </div>

          {/* Secondary Auth Actions */}
          <div className="flex flex-col gap-3">
            <button disabled={loading} type="button" onClick={handleGoogleSignIn} className="w-full py-3 rounded-xl bg-gray-50 dark:bg-[#211e25]/40 border border-gray-200 dark:border-gray-600/30 text-gray-900 dark:text-white text-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-600/60 transition-all duration-300 backdrop-blur-sm group disabled:opacity-70 disabled:cursor-not-allowed">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500 p-[2px] opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-full h-full bg-white dark:bg-[#37333a] rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-900 dark:text-white leading-none">G</span>
                </div>
              </div>
              <span className="tracking-wide">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
