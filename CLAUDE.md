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
| `src/pages/Home.jsx` | Landing page with hero, stats, featured NFTs |
| `src/pages/Gallery.jsx` | NFT gallery with filters |
| `src/pages/Merch.jsx` | Merchandise store |
| `src/pages/Artwork.jsx` | Custom art commissions |
| `src/components/GlitchedBackground.jsx` | CRT/VHS glitch effects |
| `src/components/TVStatic.jsx` | TV static overlay |
| `src/components/Navbar.jsx` | Navigation |
| `src/index.css` | Tailwind theme with Primos colors |

## Routes
| Route | Page |
|-------|------|
| `/` | Home |
| `/gallery` | NFT Gallery |
| `/about` | Collection Story |
| `/team` | Team Profiles |
| `/community` | Collector Spotlight |
| `/merch` | Merchandise Store |
| `/artwork` | Custom Art |
| `/faq` | FAQ |

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

## Development Notes
- Deployment: Vercel recommended (config in `vercel.json`)
- Testing changes on live site, not dev server
- Placeholder images (`picsum.photos`) need replacing with actual Primos artwork

## Current Status
- Basic site structure complete
- CRT/VHS visual effects working
- 17 Primos artwork images downloaded to `/public/artwork/`
- Need to integrate local artwork into Home.jsx and GlitchedBackground.jsx
