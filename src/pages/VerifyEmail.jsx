import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { InlineNotice } from '../components/AppState';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyEmail() {
  const { currentUser, sendVerificationEmail, refreshCurrentUser, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [tone, setTone] = useState('success');
  const navigate = useNavigate();
  const location = useLocation();

  const handleResend = async () => {
    setSending(true);
    const ok = await sendVerificationEmail();
    setSending(false);
    if (ok) {
      setTone('success');
      setNotice('Verification email sent! Check your inbox and spam folder.');
    } else {
      setTone('danger');
      setNotice('Could not send email right now. Please try again later.');
    }
  };

  const handleRefresh = async () => {
    const user = await refreshCurrentUser();
    if (user?.emailVerified) {
      if (location.pathname === '/auth') {
        navigate('/onboarding');
      } else {
        navigate(location.pathname, { state: location.state, replace: true });
      }
    } else {
      setTone('danger');
      setNotice('Email not verified yet. Please check your inbox and click the verification link.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <span className="material-symbols-outlined text-6xl text-brand-coral-pink mb-6">mark_email_unread</span>
      <h1 className="font-display text-4xl font-bold mb-4">Verify your email</h1>
      <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">
        We sent a verification link to <span className="text-white font-semibold">{currentUser?.email}</span>. 
        Please verify your email to secure your account and unlock all features.
      </p>
      
      {notice && (
        <div className="mb-6 max-w-md mx-auto w-full text-left">
          <InlineNotice icon={tone === 'success' ? 'check_circle' : 'error'} tone={tone} title="Update" message={notice} />
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
        <button 
          onClick={handleRefresh}
          className="w-full min-h-12 rounded-xl bg-linear-to-r from-brand-deep-purple to-brand-coral-pink text-white font-bold transition-all active:scale-95"
        >
          I've verified my email
        </button>
        <button 
          onClick={handleResend}
          disabled={sending}
          className="w-full min-h-12 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold transition-all disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Resend verification email'}
        </button>
        <button 
          onClick={handleLogout}
          className="text-gray-500 hover:text-white transition-colors text-sm font-semibold mt-4"
        >
          Use a different account
        </button>
      </div>
    </div>
  );
}
