# Chat Decoder for Cam Models

A mobile-first web app that instantly translates and explains international viewer chat messages, slang, and tone so adult content creators can quickly understand what their audience is saying without needing to learn the language.

## Get the Browser Extension

**Wassup Decoder Pro** - Auto-translates chat in real-time on cam sites!

### Features

- **Auto-Inject Translations**: Seamlessly translates incoming chat messages on sites like Chaturbate, Stripchat, and more
- **Universal Mode**: Works on almost any website with chat
- **Right-Click Translate**: Select any text and translate instantly
- **Tone Detection**: See the intent behind messages (flirty, hype, negative, etc.)
- **Smart Replies**: Get suggested responses in the viewer's language

### Get Free Access

1. **[Get your free Ko-fi Order ID](https://ko-fi.com/)** - Purchase any item to unlock 30 days of Pro
2. Enter your Order ID in the extension popup
3. Enjoy unlimited auto-translations!

---

## Web App Features

- **Instant Chat Decoder**: Paste viewer messages and get plain-language explanations with slang breakdowns and tone detection
- **Slang & Abbreviation Library**: Clickable definitions for detected slang terms with cultural context
- **Tone Detection**: Visual tags indicating message intent (friendly, flirty, negative, etc.)
- **Message History**: Saved decoded messages with search and favorites
- **Quick Reply Guidance**: Intent-based suggestions for how to respond
- Tempo scaffolding workflow is now provided by a standalone open-source scaffolder service with translation and vibe-check. This decouples scaffolding from the app and supports multi-language generation.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Storage**: LocalStorage for user data and message history

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
│   ├── decoder/          # Decoder-specific components
│   ├── layout/           # Layout components (MobileNav)
│   └── ui/               # shadcn/ui components
├── contexts/             # React Context providers
│   ├── AuthContext.tsx
│   └── MessageHistoryContext.tsx
├── pages/                # Page components
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── OnboardingPage.tsx
│   ├── DecoderPage.tsx
│   ├── HistoryPage.tsx
│   ├── SettingsPage.tsx
│   └── SafetyPage.tsx
├── utils/                # Utility functions
│   └── languageDetection.ts
└── App.tsx               # Main app component with routing
```

## Key Features Implementation

### Language Detection
Currently uses pattern matching for demo purposes. In production, integrate with:
- Google Cloud Translation API
- DeepL API
- OpenAI GPT for context-aware translation

### Data Storage
- User authentication state stored in localStorage
- Message history stored in localStorage
- For production, integrate with Supabase or Firebase

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Bottom navigation bar for easy thumb access
- Large touch targets and minimal navigation

## Future Enhancements

- Backend integration (Supabase/Firebase)
- Real-time translation API integration
- Push notifications for saved phrases
- Export message history
- Multi-language UI support
- Advanced slang database with community contributions
