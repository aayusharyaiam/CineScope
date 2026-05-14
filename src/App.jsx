import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import { StateCard } from './components/AppState';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import ShowDetail from './pages/ShowDetail';
import Search from './pages/Search';
import Actor from './pages/Actor';
import ActorsList from './pages/ActorsList';
import Shows from './pages/Shows';
import NewShows from './pages/NewShows';
import TopShows from './pages/TopShows';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Support from './pages/Support';
import VerifyEmail from './pages/VerifyEmail';
import WebsiteReviewPrompt from './components/WebsiteReviewPrompt';
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  const isPasswordUser = currentUser.providerData?.some(p => p.providerId === 'password');
  if (isPasswordUser && !currentUser.emailVerified) {
    return <VerifyEmail />;
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a1a] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      {!isAuthPage && <Navbar />}
      
      <main className={`flex-1 w-full max-w-360 mx-auto ${!isAuthPage ? 'pt-24 md:pt-28' : ''}`}>
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/show/:id" element={<ShowDetail />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/new" element={<NewShows />} />
            <Route path="/shows/top" element={<TopShows />} />
            <Route path="/search" element={<Search />} />
            <Route path="/actor/:id" element={<Actor />} />
            <Route path="/actors" element={<ActorsList />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/support" element={<Support />} />
            <Route path="/help" element={<Navigate to="/support" replace />} />
            <Route path="/watchlist" element={<Navigate to="/profile" replace />} />
            <Route
              path="*"
              element={
                <div className="px-4 py-12 min-h-[60vh] flex items-center justify-center">
                  <StateCard
                    icon="explore_off"
                    title="That page is not in the catalog"
                    message="The link may be outdated or the route may have changed. Head home and keep exploring."
                    actionLabel="Go home"
                    actionTo="/"
                    className="w-full max-w-2xl"
                  />
                </div>
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>
      
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileNav />}
      <WebsiteReviewPrompt />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
