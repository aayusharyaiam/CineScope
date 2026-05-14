import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
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

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a1a] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      {!isAuthPage && <Navbar />}
      
      <main className={`flex-1 w-full max-w-[1440px] mx-auto ${!isAuthPage ? 'pt-24 md:pt-28' : ''}`}>
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
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileNav />}
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
