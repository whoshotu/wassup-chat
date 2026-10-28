# Wassup - Chat Decoder for Creators

A mobile-first web app that instantly translates and explains international viewer chat messages, slang, and tone so content creators can quickly understand what their audience is saying without needing to learn the language.

## Features

- **Instant Chat Decoder**: Paste viewer messages and get plain-language explanations with slang breakdowns and tone detection
- **Slang & Cultural Context**: AI-powered breakdown of slang terms, abbreviations, and cultural expressions
- **Tone Detection**: Context-aware tags (friendly, flirty, negative, illegal, etc.)
- **Vibe Score**: Sentiment calculation on a 5-heart scale
- **Message History**: Saved decoded messages with search
- **Personal Dictionary**: Define the slang your own community uses so it decodes with your meaning
- **Quick Reply Guidance**: Smart reply suggestions in the viewer's language
- **Content Safety**: Automatic detection and warning for illegal content (CSAM, animal abuse, trafficking, threats)
- **Gemini AI Integration** (Optional): Enhanced analysis with Google Gemini API
- **Dark/Light Theme**: Toggle with localStorage persistence
- **PWA Support**: Installable as a Progressive Web App

## Gemini AI (Optional)

The decoder works fully without any API key using the free MyMemory translation API. For enhanced analysis, users can optionally provide their own Gemini API key:

- **Enhanced Tone Analysis**: Context-aware, nuanced tone detection
- **Slang Breakdown**: AI explains cultural context and meaning of slang
- **Smart Suggestions**: Relevant reply suggestions based on message content
- **Current Models**: `gemini-3.5-flash-lite` by default, or `gemini-3.8-flash`, both free-tier
- **Rate Limited**: 15 requests/min, 1,500/day (Gemini free tier)
- **Visible Fallback**: If the AI path fails or the limit is hit, the result says so and the free decoder is used

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

1. **[Get it on Ko-fi](https://ko-fi.com/s/443060ea79)** - Purchase to unlock 30 days of Pro
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
- **Translation**: MyMemory API (free, no key) + Gemini AI (optional)
- **Pro licensing**: Cloudflare Worker + D1 (see `license-api/`)
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
│   ├── AuthPage.tsx      # Login/signup page (UI only, no backend)
│   └── DecoderPage.tsx   # Main app (decode, history, settings, info tabs)
├── lib/                  # Shared with the extension, edit here only
│   ├── decoder.ts        # Core decoder: dictionary, detection, translation, tone, safety
│   ├── gemini.ts         # Gemini client with model fallback
│   ├── models.ts         # Supported free-tier Gemini models
│   ├── geminiRateLimit.ts # Client-side rate limit tracking (15 RPM / 1500 RPD)
│   ├── idiomHelper.ts    # Idiom disambiguation
│   ├── types.ts          # Shared decode types
│   └── utils.ts          # cn() utility (clsx + tailwind-merge)
├── data/
│   └── idioms.json       # Idiom table (shared with the extension)
├── types/
│   └── index.ts          # Re-exports shared types, app-only stats types
├── App.tsx               # Root component with routing
├── main.tsx              # Entry point
└── index.css             # Tailwind CSS + custom utilities
scripts/
└── sync-extension-lib.mjs # Copies src/lib into the extension workspace
license-api/              # Cloudflare Worker that verifies Pro purchases
extension-baseline/       # Frozen pre-fix snapshot of the extension
```

## Data Storage (All Client-Side)

| localStorage Key | Purpose |
|-----------------|---------|
| `wassup_history` | Saved decoded messages |
| `wassup_preferred_lang` | User's target language |
| `wassup_custom_dict` | Personal Dictionary entries (slang = meaning) |
| `wassup-theme` | Dark/light theme preference |
| `wassup_gemini_api_key` | Optional Gemini API key |
| `wassup_gemini_usage` | Rate limit tracking for Gemini |

## Shared code with the browser extension

`src/lib/` is the single source of truth for the decoder, Gemini client, model catalogue, idiom helper, rate limiter, and shared types. The extension does not keep its own copies by hand:

```bash
npm run sync:lib   # copies src/lib and src/data into wassup-extension/
```

The extension's `predev` and `prebuild` scripts run the sync automatically, and the generated files carry a "do not edit" banner. Edit `src/lib` only.

`wassup-extension/` is gitignored so the paid extension is not published from this repository; `extension-baseline/` holds a frozen snapshot of its pre-fix source.

## Pro license verification

The extension's 30-day Pro pass is verified by a server, not by local storage:

- `license-api/` is a Cloudflare Worker (free plan) that receives Ko-fi webhooks, stores a hash of the buyer's email and order id, and issues a 30-day ES256-signed token when the extension activates.
- The extension verifies that token against an embedded public key, so expiry cannot be extended by editing `chrome.storage`, and each purchase can be activated once.
- Deploy steps and the Ko-fi webhook setup are in [license-api/README.md](license-api/README.md).

This stops free activation, date tampering, and order-id reuse. It does not stop someone from unpacking and patching the extension bundle, which is inherent to locally installed code.

## License

GPL-3.0-only
