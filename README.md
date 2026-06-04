# Wassup - Chat Decoder for Creators

A mobile-first web app that instantly translates and explains international viewer chat messages, slang, and tone so content creators can quickly understand what their audience is saying without needing to learn the language.

## Features

- **Instant Chat Decoder**: Paste viewer messages and get plain-language explanations with slang breakdowns and tone detection
- **Slang & Cultural Context**: AI-powered breakdown of slang terms, abbreviations, and cultural expressions
- **Tone Detection**: Context-aware tags (friendly, flirty, negative, illegal, etc.)
- **Vibe Score**: Sentiment calculation on a 5-heart scale
- **Message History**: Saved decoded messages with search
- **Quick Reply Guidance**: Smart reply suggestions in the viewer's language
- **Content Safety**: Automatic detection and warning for illegal content (CSAM, animal abuse, trafficking, threats)
- **Gemini AI Integration** (Optional): Enhanced analysis with Google Gemini API
- **Dark/Light Theme**: Toggle with localStorage persistence
- **PWA Support**: Installable as a Progressive Web App

## Gemini AI (Optional)

The decoder works fully without any API key using free Google Translate. For enhanced analysis, users can optionally provide their own Gemini API key:

- **Enhanced Tone Analysis**: Context-aware, nuanced tone detection
- **Slang Breakdown**: AI explains cultural context and meaning of slang
- **Smart Suggestions**: Relevant reply suggestions based on message content
- **Rate Limited**: 15 requests/min, 1,500/day (Gemini free tier)
- **Graceful Fallback**: Automatically falls back to free decoder if Gemini fails or rate limit is hit

Get a free API key at [aistudio.google.com](https://aistudio.google.com)

## Content Safety

The decoder automatically scans messages for illegal content and displays prominent warnings:

- **CSAM/Child Exploitation**: Detected across multiple languages (English, Spanish, etc.)
- **Animal Abuse/Bestiality**: Flagged with reporting guidance
- **Human Trafficking**: Detected and flagged
- **Threats/Violence**: Doxxing and violence threats flagged

All detection runs client-side. Adult/NSFW content is allowed (this app is for cam models).

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
- **Storage**: LocalStorage for user data, message history, and API keys
- **Translation**: Google Translate API (free, no key) + Gemini AI (optional)
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
│   ├── decoder.ts        # Core decoder: language detection, translation, tone analysis, safety
│   ├── gemini.ts         # Gemini API client for enhanced AI analysis
│   ├── geminiRateLimit.ts # Client-side rate limit tracking (15 RPM / 1500 RPD)
│   └── utils.ts          # cn() utility (clsx + tailwind-merge)
├── types/
│   └── index.ts          # Shared type definitions
├── App.tsx               # Root component with routing
├── main.tsx              # Entry point
└── index.css             # Tailwind CSS + custom utilities
```

## Data Storage (All Client-Side)

| localStorage Key | Purpose |
|-----------------|---------|
| `wassup_history` | Saved decoded messages |
| `wassup_preferred_lang` | User's target language |
| `wassup-theme` | Dark/light theme preference |
| `wassup_gemini_api_key` | Optional Gemini API key |
| `wassup_gemini_usage` | Rate limit tracking for Gemini |

## License

GPL-3.0-only
