# CineScope

A modern, glassmorphic cinematic discovery dashboard. Browse trending movies & TV shows, get AI-curated recommendations, track your watch history, and build a gamified profile.

## Features

- **Pick of the Day** — AI-curated daily movie recommendation, cached in Firestore
- **CineBrain Magic Search** — Natural-language AI movie search via NVIDIA NIM (`minimaxai/m2.7`)
- **Critical Consensus** — Aggregated ratings from IMDb, Rotten Tomatoes, Metacritic
- **Personal Library** — Watchlist, watched history, favorites, 5-star ratings
- **Gamified Profile** — XP levels, stats tracking, tabbed dashboard
- **Interactive Cast** — Horizontal carousels with actor profile links
- **Live Actor Search** — Debounced global TMDB search (300ms)
- **Dark/Light Theme** — Persisted to localStorage
- **Glassmorphism UI** — Custom Tailwind v4 theme with backdrop blur panels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling | Tailwind CSS v4, GSAP 3 |
| Auth & DB | Firebase Authentication, Firestore (multi-tab persistent cache) |
| APIs | TMDB (primary metadata), OMDB (ratings), NVIDIA NIM (AI recommendations) |

## Architecture Highlights

- **TMDB ISP Resilience** — Attempts direct fetch, falls back to a Vercel serverless proxy (`/api/tmdb`), then public CORS proxies, then AI-generated fallback data
- **NVIDIA NIM Proxy** — In production, AI calls go through a Vercel serverless function (`/api/nvidia`) to avoid CORS and keep API keys server-side
- **Daily Caching** — Pick of the Day and dynamic fallback lists are cached in Firestore and served instantly on repeat visits
- **Optimistic UI** — Watchlist/favorite/rating updates apply immediately with background Firestore sync

## Project Structure

```
src/
├── components/    # Reusable UI (Navbar, MovieCard, Skeleton, Toast, etc.)
├── pages/         # Route views (Home, MovieDetail, Profile, Search, etc.)
├── services/      # API clients (api.js) and Firestore CRUD (userMedia.js)
├── context/       # React context providers (AuthContext, ThemeContext)
├── firebase.js    # Firebase init with multi-tab persistence
├── App.jsx        # Root routing + layout
└── main.jsx       # Entry point (wraps app in ToastProvider)

api/               # Vercel serverless functions
├── nvidia.mjs     # Proxies NVIDIA NIM API calls server-side
└── tmdb.mjs       # Proxies TMDB API calls server-side
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Environment Variables

Copy your `.env` with the following keys:

| Variable | Source |
|----------|--------|
| `VITE_TMDB_API_KEY` | [TMDB](https://developer.themoviedb.org/reference/intro/getting-started) |
| `VITE_OMDB_API_KEY` | [OMDB](https://www.omdbapi.com/) |
| `VITE_NVIDIA_API_KEY` | [NVIDIA NIM](https://build.nvidia.com/) |
| `VITE_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com/) |

## Deployment (Vercel)

```bash
npm run build    # Outputs to dist/
```

1. Push to GitHub
2. Import repo in Vercel
3. Add all `VITE_*` env vars in Vercel Dashboard → Settings → Environment Variables
4. Deploy — `api/tmdb.mjs` and `api/nvidia.mjs` are auto-detected as serverless functions

The serverless proxies bypass regional ISP blocks (e.g. TMDB blocked in India) by routing requests through Vercel's infrastructure.
