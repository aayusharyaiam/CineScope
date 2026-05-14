# CineScope — Product Requirements Document (PRD)

**Version:** 1.0  
**Developer:** Aayush  
**Project Type:** Portfolio Web Application  
**Status:** Ready for Development

---

## 🎨 Design System Reference

> **[MCP DESIGN PROMPT — PASTE STITCH OUTPUT HERE]**
>
> _After generating the design in Stitch, paste the full design prompt / component spec / token output here so the AI builder (Antigravity) can reference the visual language while building._

---

## 1. Project Overview

**CineScope** is a modern, AI-powered movie and web series discovery platform. It aggregates ratings from multiple sources (IMDb, Rotten Tomatoes, Metacritic), provides AI-driven personalized recommendations, and offers rich user profiles with taste analytics. The app is designed to be usable without login for core discovery features, with premium personalization unlocked after sign-up.

### 1.1 Core Philosophy
- **Search & Discover** — Anyone can search and explore without barriers
- **Personalize & Engage** — Logged-in users get AI recommendations and taste profiles
- **Convert Naturally** — Non-logged-in users are shown the value of signing up contextually, never forcibly

### 1.2 Tech Stack (Recommended)
- **Frontend:** React.js / Next.js
- **Backend / Auth / DB:** Firebase (Authentication + Firestore)
- **Movie Data API:** TMDB API (free) + OMDB API (free, for IMDb/RT scores)
- **AI Recommendations:** Google Gemini API (free tier) or Groq API (free tier)
- **Streaming Availability:** JustWatch API or TMDB watch providers
- **Hosting:** Vercel / Firebase Hosting

---

## 2. Design Language

### 2.1 Brand Identity
- **App Name:** CineScope
- **Tagline:** *"Every Frame. Every Rating. Every Recommendation."*
- **Developer Credit:** Designed & Developed by Aayush

### 2.2 Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Deep Purple | `#845ec2` | Primary brand, navbar, key UI |
| Pink-Purple | `#d65db1` | Secondary accent, hover states |
| Coral Pink | `#ff6f91` | CTA buttons, highlights, badges |
| Peach Orange | `#ff9671` | Warm accents, rating bars |
| Amber Yellow | `#ffc75f` | Star ratings, trending indicators |
| Lime Yellow | `#f9f871` | Success states, availability badges |

**Hero Gradient:** `#845ec2 → #ff6f91 → #ffc75f`

### 2.3 Design Style
- **Glassmorphism** — frosted glass cards with backdrop blur
- **Material 3** — ripple effects, elevated surfaces, expressive components
- **Dark / Light Mode** — toggle available globally
  - Dark: Deep navy/black base, gradient as accents
  - Light: Soft white/cream base, gradient more vivid
- **Typography:** Elegant display font + refined body font pairing
- **Animations:**
  - Micro-interactions (button clicks, heart pop, star bounce)
  - Scroll-triggered reveals (cards fade/slide in on scroll)
  - Hover effects (card lift, glow, image zoom)
  - Skeleton shimmer loaders (no spinners)
  - Page transitions (smooth fade/slide)
  - Parallax hero on movie detail page

---

## 3. User Roles

| Role | Access |
|------|--------|
| Guest (not logged in) | Home, Search, Movie Detail Page, Actor Pages, Browse |
| Registered User | All guest features + AI Recommendations, Watchlist, Profile, Taste Score, Watch History |

---

## 4. Pages & Features

---

### 4.1 Home Page (Public)

**Purpose:** Entry point for all users. Showcases trending content and drives exploration.

**Components:**
- **Hero Section** — Full-width gradient banner with search bar (large, centered). Animated tagline.
- **Trending Today** — Horizontal scroll row of movie cards (from TMDB trending endpoint)
- **Top Rated All Time** — Horizontal scroll row
- **New on Streaming** — What's newly added on Netflix / Prime / Disney+ this week
- **Genre Pills** — Horizontally scrollable genre filter chips (Horror, Comedy, Thriller, Romance, Sci-Fi, Documentary, etc.). Clicking a genre filters a results grid below.
- **For Logged-In Users:** Replace hero with personalized greeting + "Your AI Picks Today" row

**Animations:**
- Hero text staggered reveal on load
- Card rows slide in on scroll
- Genre pills ripple on tap/click
- Movie cards lift + glow on hover

---

### 4.2 Search & Filter Page (Public)

**Purpose:** Comprehensive search for movies and web series.

**Components:**
- **Search Bar** — Top of page, with real-time suggestions as user types
- **Filter Panel** — Collapsible sidebar / bottom sheet on mobile
  - Genre (multi-select)
  - Year range slider
  - Minimum IMDb rating slider
  - Platform availability (Netflix, Prime, Disney+, etc.)
  - Type (Movie / Web Series)
- **Sort Options** — IMDb Rating, Popularity, Release Date, Alphabetical
- **Results Grid** — Responsive card grid (3 cols desktop, 2 cols tablet, 1 col mobile)

**Animations:**
- Results grid staggered card reveal
- Filter panel smooth slide open/close
- Search suggestions dropdown fade in

---

### 4.3 Movie / Web Series Detail Page (Public)

**Purpose:** The core feature — comprehensive information and ratings for any title.

**Sections (in order):**

#### Section A — Hero
- Full-width backdrop image with parallax scroll effect
- Poster card (glass-style) overlaid on backdrop
- Title, year, genre tags, runtime, age rating

#### Section B — Ratings Aggregator ⭐ *(Core Feature)*
- Visual ratings breakdown widget showing:
  - IMDb score (with vote count)
  - Rotten Tomatoes — Critic Score + Audience Score separately
  - Metacritic score
  - CineScope Community Score (average of user ratings)
- Side-by-side comparison bar chart (critic vs audience divergence)
- Color-coded: green (great), amber (mixed), red (poor)

#### Section C — Where to Watch
- Platform availability badges (Netflix, Prime, Disney+, Apple TV+, etc.)
- Click opens streaming platform (or JustWatch page)

#### Section D — Trailer
- Embedded YouTube trailer (auto-fetched via TMDB)

#### Section E — Cast & Crew
- Horizontal scroll of cast cards (photo, name, character)
- Director, Writer cards
- Click on any person → goes to Actor/Director Page

#### Section F — Similar Movies / More Like This
- Horizontal scroll row of related titles (from TMDB)

#### Section G — AI Recommendation Teaser *(Conversion Hook)*
- **For Guest users:** Glassmorphic banner — *"🎬 Love this movie? Get personalized picks tailored to your taste — Sign up free"* with Sign Up CTA button
- **For Logged-In users:** Full AI recommendation block — "Because you liked [this movie]…" showing 5–8 personalized picks

#### Section H — User Rating
- **Guest:** Shows prompt to sign in to rate
- **Logged-In:** Star rating widget (1–5 stars), saves to Firebase, adds to watch history

---

### 4.4 Actor / Director Page (Public)

**Purpose:** Explore filmography and biography of cast/crew members.

**Components:**
- Profile photo, name, bio, birthdate, nationality
- Known For — top 6 most popular titles
- Full Filmography — sortable grid (by year, rating, popularity)
- Clicking any title goes to that Movie Detail Page

---

### 4.5 Auth Pages

#### Sign Up
- Email + Password OR Google Sign-In (Firebase)
- After signup → Onboarding Flow

#### Login
- Email + Password OR Google Sign-In
- "Forgot Password" link

#### Onboarding Flow (Post Sign-Up, One-Time)
**Step 1 — Quick Pick** *(Default, shown first)*
- "Tell us what you love watching"
- Searchable movie/show tiles — user selects 10–15 favorites
- Clean, visual, tap-friendly grid

**Step 2 — Import History** *(Optional, collapsed)*
- "Want even better recommendations? Import your watch history"
- Expandable section with platform-wise step-by-step guides:
  - **Netflix:** How to download watch history CSV (with screenshots)
  - **Amazon Prime:** Steps
  - **Disney+:** Steps
- File upload button
- "Skip for now" option always visible

---

### 4.6 Home Page — Logged-In State

**Additional components for authenticated users:**
- Personalized greeting with user's name
- **"Your AI Picks Today"** — AI-generated recommendation row
- **"Continue Watching"** — Resume from watchlist
- **"New Arrivals for You"** — New streaming content matching taste
- **Taste Snapshot Widget** — Small card showing current Cinephile Title + top genre

---

### 4.7 Profile Page (Logged-In Only)

**Purpose:** Personal cinema identity and history hub.

**Sections:**

#### Profile Header
- Avatar (Firebase Auth photo or initials fallback)
- Display name, member since date
- Edit Profile button

#### Taste Score / Cinephile Badge 🏆
- Dynamic title based on watch history:
  - "Casual Viewer" → "Film Enthusiast" → "Cinephile" → "Film Critic" → "Auteur"
- Animated badge with gradient glow

#### Stats Dashboard
- Total movies/shows watched
- Total hours watched (estimated from runtimes)
- Favorite genre (most watched)
- Favorite decade
- Favorite director / actor (most watched)

#### Badges Collection
- **Oscar Winner Watcher** — watched 3+ Oscar Best Picture winners
- **Cult Classic Collector** — watched cult classics
- **Hidden Gem Hunter** — watched low-popularity but high-rated films
- **World Cinema Explorer** — watched films from 5+ countries
- **Binge Master** — completed 3+ full web series
- More badges unlockable over time

#### Watch History
- Chronological list of watched titles with personal rating
- Search/filter within history
- Remove entries option

#### Watchlist
- "Want to Watch" list
- Mark as Watched button on each item
- Sort by date added, genre, rating

#### Import History (Access Anytime)
- Same as onboarding Step 2, accessible from profile

---

### 4.8 Watchlist (Logged-In Only)

**Access:** Via Profile Page + quick-add button on every movie card/page

**Features:**
- Add / Remove titles
- Mark as Watched (moves to history, prompts for rating)
- Sort and filter

---

## 5. Navigation Structure

### Desktop
- **Top Navbar:** CineScope logo | Search bar | Browse | Trending | [Login / Sign Up] or [Avatar + Profile dropdown]
- **Footer:** Links (About, Contact) | "Designed & Developed by Aayush" | Theme toggle

### Mobile
- **Bottom Navigation Bar:** Home | Search | Watchlist | Profile
- **Top Bar:** CineScope logo + Search icon + Theme toggle

---

## 6. AI Recommendation Engine

### How It Works
1. User completes onboarding (picks 10–15 movies OR imports CSV)
2. On login / on demand, app sends a prompt to Gemini API:
   - User's liked movies, genres, actors, directors
   - Watch history (if available)
   - Recently rated titles
3. Gemini returns a ranked list of recommended titles (JSON)
4. App fetches details for each recommended title from TMDB
5. Results cached in Firestore — refreshed weekly or on new ratings

### Prompt Template (for AI builder reference)
```
You are a movie recommendation engine. Based on the following user preferences, recommend 10 movies or web series they would love.

User's favorite movies: [LIST]
Favorite genres: [LIST]
Favorite actors: [LIST]
Favorite directors: [LIST]
Recently watched: [LIST]

Return ONLY a JSON array of TMDB movie IDs with a brief reason for each recommendation. No other text.
```

### Cost Management
- Cache recommendations in Firestore
- Only regenerate on significant new data (3+ new ratings)
- Use Gemini free tier (generous for this scale)
- Fallback: genre + actor matching algorithm if API quota exceeded

---

## 7. Firebase Data Structure

```
/users/{userId}
  - displayName: string
  - email: string
  - photoURL: string
  - createdAt: timestamp
  - onboardingComplete: boolean
  - preferences:
    - favoriteMovies: [tmdbId, ...]
    - favoriteGenres: [string, ...]
    - favoriteActors: [personId, ...]
    - favoriteDirectors: [personId, ...]

/users/{userId}/watchHistory/{tmdbId}
  - tmdbId: number
  - title: string
  - watchedAt: timestamp
  - userRating: number (1-5)
  - posterPath: string

/users/{userId}/watchlist/{tmdbId}
  - tmdbId: number
  - title: string
  - addedAt: timestamp
  - posterPath: string

/users/{userId}/recommendations
  - generatedAt: timestamp
  - items: [{tmdbId, reason}, ...]

/users/{userId}/badges
  - [badgeId]: { earnedAt: timestamp }
```

---

## 8. External APIs

| API | Purpose | Cost |
|-----|---------|------|
| TMDB API | Movie data, images, cast, trailers, similar, trending, streaming providers | Free |
| OMDB API | IMDb score, Rotten Tomatoes score, Metacritic | Free (1000 req/day) |
| Google Gemini API | AI recommendations | Free tier |
| YouTube embed | Trailers | Free |
| Firebase | Auth + Firestore DB | Free tier |

---

## 9. Responsive Design Requirements

- **Mobile First** — design for 375px width upward
- **Breakpoints:** 375px (mobile) | 768px (tablet) | 1024px (laptop) | 1440px (desktop)
- **Touch targets:** minimum 44x44px on mobile
- **Horizontal scroll rows** — native scroll on mobile, arrow buttons on desktop
- **Bottom nav on mobile**, top nav on desktop
- **No horizontal overflow** at any breakpoint

---

## 10. Performance Requirements

- Skeleton loaders on all data-fetching states (no spinners)
- Lazy load images (poster cards, backdrops)
- Paginate search results and history lists (20 items per page)
- Cache TMDB responses in sessionStorage where appropriate
- Lighthouse score target: 85+ on mobile

---

## 11. Scope for v1 (Portfolio Launch)

### In Scope
- All 8 pages above
- Full glassmorphic + Material 3 design
- Day/Night mode
- Firebase Auth + Firestore
- TMDB + OMDB integration
- AI Recommendations (Gemini)
- Onboarding flow
- Watchlist + Watch History
- Taste Score + Badges
- Ratings visual widget
- Actor/Director pages
- Where to Watch badges
- Trailer embed
- Responsive (mobile + desktop)

### Out of Scope for v1 (Future)
- Social features (following friends, sharing lists)
- User-written long reviews
- Native mobile app
- Paid subscription tier
- Push notifications

---

## 12. Footer

All pages include:
> *"Designed & Developed by Aayush"*

---

*PRD Version 1.0 — CineScope by Aayush*
