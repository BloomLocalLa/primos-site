# Project: PRIMOS NFT Website

## Overview
A bold, 90s TV/CRT-inspired marketing website for the Primos NFT collection on Solana. Features heavy glitch effects, VHS static, scanlines, and retro aesthetics.

## Tech Stack
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Routing:** React Router v7
- **Payments:** Stripe + Solana Pay
- **NFT Data:** Magic Eden API

## Getting Started
```bash
npm install
npm run dev
```

## Key Files
| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with routes and cart context |
| `src/pages/Home.jsx` | Landing page with hero, stats, featured NFTs, floating NFTs, best deals |
| `src/pages/Gallery.jsx` | NFT gallery with filters, sorting, detail modal |
| `src/pages/About.jsx` | Collection story + Explore Traits builder |
| `src/pages/Community.jsx` | Top holders, live activity, community art section |
| `src/pages/Team.jsx` | Team profiles |
| `src/pages/Merch.jsx` | Merchandise store (coming soon) |
| `src/pages/Artwork.jsx` | Custom art commissions (coming soon) |
| `src/pages/FAQ.jsx` | FAQ with accordion |
| `src/components/GlitchedBackground.jsx` | CRT/VHS glitch effects |
| `src/components/TVStatic.jsx` | TV static overlay |
| `src/components/Navbar.jsx` | Navigation with mobile menu |
| `src/components/NFTCard.jsx` | Reusable NFT card with rarity badges |
| `src/components/FAQAccordion.jsx` | Expandable FAQ items |
| `src/lib/magiceden.js` | Magic Eden API integration |
| `api/magiceden.js` | Vercel serverless proxy for Magic Eden |
| `src/index.css` | Tailwind theme with Primos colors |

## Routes
| Route | Page |
|-------|------|
| `/` | Home |
| `/gallery` | NFT Gallery |
| `/about` | Collection Story + Explore Traits |
| `/team` | Team Profiles |
| `/community` | Collector Spotlight |
| `/merch` | Merchandise Store |
| `/artwork` | Custom Art |
| `/faq` | FAQ |

## Magic Eden API Integration
API calls proxied through Vercel serverless function (`api/magiceden.js`) for CORS.

### Endpoints Used
- `listings` - Get listed NFTs with prices
- `stats` - Collection stats (floor, volume, holders)
- `holder_stats` - Top holders data
- `activities` - Recent sales/listings
- `token` - Individual NFT metadata with attributes
- `mmm_pools` - AMM pool listings

### Key Functions (`src/lib/magiceden.js`)
- `getListedNFTs(offset, limit)` - Fetch paginated listings
- `getCollectionStats()` - Floor price, volume, etc.
- `getTopHolders()` - Holder rankings
- `getRecentActivity()` - Sales feed
- `getTokenMetadata(mintAddress)` - NFT attributes

## Primos Artwork
Local artwork files stored in `/public/artwork/` as AVIF images with IPFS hashes as filenames.

### Available Images (17 total)
```
/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif
/artwork/QmagjfWJXmrStQP7sYsEqytPV2yXtyRhKTcT3Ngqw8D1MA.avif
/artwork/QmamhGh1LjF6tTdWZerkVQjtQVkcThminw57MB3RgU9JVc.avif
/artwork/QmaXp9riawoo7HMUmZC3SxCPVxTxytGgsoAtCHfT65DFxK.avif
/artwork/QmbEf76maCZRCUEB8ddGQHHP4iDpr5bPY5aCk25KjRYvSn.avif
/artwork/QmbR2gsdtid7y3DLZ7ZmDxPs2XWhpX4sTnh5sRnKJbrC5g.avif
/artwork/QmcjHTh9pyhzSieqCDx5xTu48oUkYvVsHega2LrrDzuUUj.avif
/artwork/QmdgfUXRHpMHF2cDXS3tM6tedErmD41PkmkP2KpdCUn9LZ.avif
/artwork/Qme1k7C6Fes3o4TcXBGDP2z8scm7ZKiqUxmjhSS1cAxpqF.avif
/artwork/QmeuoJELXHRKDHtkhu2bZnPxorGEmY2aogMmsAL2AnG6AQ.avif
/artwork/QmNMrJGJGcDW5pgxtyzaVfWwMuHqFFpxBi5mYBtKyrp67a.avif
/artwork/QmR6oggbP6jQQ58vcq4v9MnVqdyzcLdVop2txioTNQHd8M.avif
/artwork/QmRS4dqpURvQZgL8p2cufx49jFrSyZStwX7irCpPbUNKwi.avif
/artwork/QmUYe9EFz3g6LLfot2j55bgSsRUHSYYt2ZwsBG4WbcAyDN.avif
/artwork/QmVCHSGKe3CqcXBS4DMnYKkyurQGcqPPdpsdaDhPCkz6RN.avif
/artwork/QmX6ywFVdXwPjjUYcYEqhKMttWmW8ueCzZxHSmj8EKNzbL.avif
/artwork/QmZUWtRTo4RigUSbPwHWQ93gM6azjP1hZCP2HdCLWdp93g.avif
```

## Theme Colors (defined in src/index.css)
- `--color-primo-pink: #E91E8C` (primary accent)
- `--color-primo-cyan: #00CED1`
- `--color-primo-yellow: #FFD700`
- `--color-primo-purple: #9B59B6`
- `--color-primo-green: #32CD32`

## Development Notes
- Deployment: Vercel (config in `vercel.json`)
- Testing changes on live site, not dev server
- All pages are fully mobile-responsive (optimized for 375px+)
- IPFS images converted to HTTP gateway URLs (`nftstorage.link`)

## Mobile Responsiveness
All pages optimized with Tailwind responsive classes:
- Smaller padding/margins on mobile (`p-4 md:p-8`)
- Reduced text sizes (`text-sm md:text-base`)
- Thinner borders (`border-2 md:border-4`)
- Adjusted grid columns (`grid-cols-2 md:grid-cols-4`)
- Hidden non-essential elements on mobile

## Current Status
- Site structure complete with all pages
- Magic Eden API integration working (listings, stats, holders, activities, token metadata)
- Explore Traits feature on About page (18 trait categories)
- "Buy Your Dream Primo" / "Share Your Dream Primo" buttons
- "From the Community" section on Community page
- All pages mobile-optimized
- CRT/VHS visual effects working
