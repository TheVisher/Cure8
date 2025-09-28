# Cure8 – Cosmic Bookmark Canvas

Cure8 is a local-first bookmarking studio for catching links on the fly, auto-enriching them with previews, and browsing everything inside a cinematic, neon interface. Paste a URL, type to search, drag in exports—your library always stays on your machine, ready when inspiration strikes.

## Core Features

- **Quick Capture Omnibox** – Paste or type from anywhere; Cure8 stores the link instantly and fetches metadata in the background.
- **Auto Preview Service** – A bundled preview microservice (Node + Puppeteer) resolves titles, favicons, poster images, and descriptions for richer cards.
- **Multi-Layout Canvas** – Instantly flip between Grid, Masonry, List, or Compact views depending on the artwork you’re browsing.
- **Adaptive Boards** – Responsive grid with intelligent card sizing and animated hover glows that scale from phone to ultra-wide monitors.
- **Powerful Search** – Debounced global search across titles and domains with instant feedback as you type.
- **Import & Export** – JSON import/export keeps your collection portable and easy to back up or share.
- **Local Persistence** – Everything lives in `localStorage`; no accounts, no cloud, just your data.

## Getting Started

```bash
git clone https://github.com/yourusername/cure8.git
cd cure8
npm install
npm start
```

The app boots on `http://localhost:3000`. The link preview service defaults to `http://localhost:8787`. Adjust the endpoint inside **Settings → Link Preview Service** if you host it elsewhere.

### Preview Service

```bash
cd services/link-preview
npm install
npm run dev
```

This Express service exposes `/preview?url=...` and returns metadata consumed by the React app. A `/health` route is included for uptime checks.

## Project Structure

```
cure8/
├── public/                  # CRA public assets
├── src/                     # React UI
│   ├── components/          # App shell, cards, sidebar
│   └── screens/             # Grid + Home views
├── services/link-preview/   # Metadata service
└── README.md
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Launch the React dev server |
| `npm test` | Run the Jest + Testing Library suite |
| `npm run build` | Production bundle |
| `npm run dev` (inside `services/link-preview`) | Start preview API |

## Contributing

1. Fork and branch (`git checkout -b feature/idea`).
2. Make your change with tests or notes.
3. Submit a PR describing the improvement.

## Support

Questions, ideas, or bugs? Drop a line at **support@cure8s.com**.

---

**Cure8** – Capture links, curate vibes.
