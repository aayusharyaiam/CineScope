import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import BackToTop from './components/BackToTop';
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
import { CardSkeleton } from './components/Skeleton';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function RouteWrapper({ children }) {
  return (
    <PageTransition>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </PageTransition>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a1a] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      
      <main className={`flex-1 w-full max-w-[1440px] mx-auto ${!isAuthPage ? 'pt-24 md:pt-28' : ''}`}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RouteWrapper><Home /></RouteWrapper>} />
          <Route path="/movie/:id" element={<RouteWrapper><MovieDetail /></RouteWrapper>} />
          <Route path="/show/:id" element={<RouteWrapper><ShowDetail /></RouteWrapper>} />
          <Route path="/shows" element={<RouteWrapper><Shows /></RouteWrapper>} />
          <Route path="/shows/new" element={<RouteWrapper><NewShows /></RouteWrapper>} />
          <Route path="/shows/top" element={<RouteWrapper><TopShows /></RouteWrapper>} />
          <Route path="/search" element={<RouteWrapper><Search /></RouteWrapper>} />
          <Route path="/actor/:id" element={<RouteWrapper><Actor /></RouteWrapper>} />
          <Route path="/actor" element={<Navigate to="/actors" replace />} />
          <Route path="/actors" element={<RouteWrapper><ActorsList /></RouteWrapper>} />
          <Route path="/auth" element={<RouteWrapper><Auth /></RouteWrapper>} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <RouteWrapper><Profile /></RouteWrapper>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileNav />}
      {!isAuthPage && <BackToTop />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
