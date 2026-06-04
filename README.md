# Wassup - Chat Decoder for Creators

A mobile-first web app that instantly translates and explains international viewer chat messages, slang, and tone so content creators can quickly understand what their audience is saying without needing to learn the language.

## Features

- **Instant Chat Decoder**: Paste viewer messages and get plain-language explanations with slang breakdowns and tone detection
- **Slang & Abbreviation Library**: Clickable definitions for detected slang terms with cultural context
- **Tone Detection**: Visual tags indicating message intent (friendly, flirty, negative, etc.)
- **Vibe Score**: Sentiment calculation on a 5-heart scale
- **Message History**: Saved decoded messages with search and favorites
- **Quick Reply Guidance**: Intent-based suggestions for how to respond
- **Dark/Light Theme**: Toggle with localStorage persistence
- **PWA Support**: Installable as a Progressive Web App

## Get the Browser Extension

**Wassup Decoder Pro** - Auto-translates chat in real-time on cam sites!

### Features

- **Auto-Inject Translations**: Seamlessly translates incoming chat messages on sites like Chaturbate, Stripchat, and more
- **Universal Mode**: Works on almost any website with chat
- **Right-Click Translate**: Select any text and translate instantly
- **Tone Detection**: See the intent behind messages (flirty, hype, negative, etc.)
- **Smart Replies**: Get suggested responses in the viewer's language

### Get Access

1. **[Get it on Ko-fi](https://ko-fi.com/anthonylopez74414)** - Purchase to unlock 30 days of Pro
2. Install the extension in Chrome or Brave
3. Enjoy unlimited auto-translations!

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Storage**: LocalStorage for user data and message history
- **PWA**: vite-plugin-pwa with Workbox

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── ui/               # shadcn/ui components
├── contexts/
│   └── ThemeContext.tsx   # Dark/light theme provider
├── pages/
│   ├── LandingPage.tsx   # Marketing/landing page
│   ├── AuthPage.tsx      # Login/signup page
│   └── DecoderPage.tsx   # Main app (decode, history, settings, info tabs)
├── lib/
│   ├── decoder.ts        # Core decoder logic: language detection, translation, tone analysis
│   └── utils.ts          # cn() utility (clsx + tailwind-merge)
├── types/
│   └── index.ts          # Shared type definitions
├── App.tsx               # Root component with routing
├── main.tsx              # Entry point
└── index.css             # Tailwind CSS + custom utilities
```

## Key Features Implementation

### Language Detection
Uses pattern matching for scripts (Japanese, Korean, Chinese, Arabic, Russian) and common word detection. In production, integrate with:
- Google Cloud Translation API
- DeepL API
- OpenAI GPT for context-aware translation

### Data Storage
- User authentication state stored in localStorage
- Message history stored in localStorage
- Theme preference stored in localStorage

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Bottom navigation bar for easy thumb access
- Large touch targets and minimal navigation
- PWA installable on mobile and desktop

## License

GPL-3.0-only
