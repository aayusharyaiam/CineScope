# CineScope 🎬

CineScope is a modern, immersive web application designed for movie and TV show enthusiasts. It provides a rich interface to discover trending media, explore detailed information about titles and actors, and build a personalized, gamified profile tracking your cinematic journey.

## ✨ Key Features

### 🎨 Stunning, Modern UI
- **Rich Aesthetics**: Built with TailwindCSS utilizing a custom color palette, glassmorphism panels, and smooth background gradients.
- **Micro-Animations**: Uses GSAP (GreenSock) for high-performance entrance animations, hover states, and dynamic routing transitions.
- **Responsive Layout**: Seamlessly adapts from mobile devices to ultra-wide desktop monitors.

### 🔍 Media Discovery & Details
- Browse trending, top-rated, and newly released movies and TV shows.
- Explore dedicated pages for media details, including cast overviews, trailers, and similar recommendations.
- **Critical Consensus**: Aggregates ratings from IMDb, Rotten Tomatoes, and Metacritic (powered by OMDB).
- **Intelligent API Proxying**: Built-in fallback proxies for the TMDB API to automatically bypass regional ISP blocks and ensure a seamless experience.

### 👤 User Authentication & Profiles
- Secure Sign-up, Login, and Google OAuth provided by Firebase Authentication.
- **Gamified Tracking**: Earn Experience Points (XP) and level up your profile as you watch more titles and write reviews.
- **Dynamic Stats**: Automatically calculates your total titles watched, estimated hours spent watching, and total reviews.

### 📚 Personal Library Management
- **Watchlist**: Keep track of what you want to watch next.
- **Watched History**: Mark titles as seen and rate them out of 5 stars.
- **Favorites**: Add a "Heart" to your top titles and display them in a dedicated grid on your profile.
- **Offline Persistence**: Leveraging Firebase Firestore local caching so your profile loads instantly, even on unstable connections, and syncs automatically in the background.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS (v4)
- **Animations**: GSAP (GreenSock Animation Platform)
- **Backend / Database**: Firebase (Auth & Firestore)
- **External APIs**: 
  - [TMDB API](https://developer.themoviedb.org/reference/intro/getting-started) (Primary media data)
  - [OMDB API](https://www.omdbapi.com/) (Auxiliary rating data)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/aayusharyaiam/CineScope.git
   cd CineScope
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your API keys and Firebase configuration. You will need keys from TMDB, OMDB, and a Firebase project.
   
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_OMDB_API_KEY=your_omdb_api_key
   ```
   *(Note: The Firebase configuration is currently handled directly in `src/firebase.js`. For a production deployment, ensure you restrict your Firebase and API keys appropriately).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).

---

## 🏗️ Project Structure

- `/src/components/` - Reusable UI elements (Navbar, MovieCard, UserActions, etc.)
- `/src/pages/` - Main route views (Home, MovieDetail, Profile, etc.)
- `/src/services/` - External API handlers (`api.js`) and database interactions (`userMedia.js`)
- `/src/context/` - React Context providers (`AuthContext`, `ThemeContext`)

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/aayusharyaiam/CineScope/issues).
