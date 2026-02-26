# PRIMOS NFT Website

A bold, loud, 90s TV-inspired website for the Primos NFT collection on Solana.

## Features

- **Gallery**: Browse all 2,746 Primos with Magic Eden API integration
- **Merch Store**: Purchase merchandise with Stripe and Solana Pay
- **Custom Artwork**: Commission custom art in the Primos style
- **Community**: Spotlight collectors and community activity
- **Interactive Design**: Heavy animations, glitch effects, retro aesthetics

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Framer Motion (animations)
- React Router (navigation)
- Stripe (card payments)
- Solana Pay (crypto payments)
- Magic Eden API (NFT data)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_MERCHANT_WALLET=your_solana_wallet_address
VITE_MAGIC_EDEN_API_KEY=optional_api_key
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, stats, featured NFTs |
| `/gallery` | NFT gallery with filters and search |
| `/about` | Collection story and values |
| `/team` | Team member profiles |
| `/community` | Collector spotlight and activity |
| `/merch` | Merchandise store |
| `/artwork` | Custom art commissions |
| `/faq` | Frequently asked questions |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Or use the CLI:

```bash
npm install -g vercel
vercel
```

### Manual Build

```bash
npm run build
# Output in ./dist
```

## Customization

### Colors

Edit colors in `src/index.css`:

```css
@theme {
  --color-primo-pink: #FF1493;
  --color-primo-cyan: #00FFFF;
  --color-primo-yellow: #FFFF00;
  /* ... */
}
```

### Collection Symbol

Update the Magic Eden collection symbol in `src/lib/magiceden.js`:

```js
const COLLECTION_SYMBOL = 'your-collection-symbol'
```

### Social Links

Update social links in:
- `src/components/Footer.jsx`
- `src/components/Navbar.jsx` (if applicable)

## Animations

The site uses Framer Motion for animations. Key effects:

- **Glitch text**: Hover effect on headings
- **TV static**: Canvas-based noise overlay
- **Scanlines**: CSS-based CRT effect
- **RGB shift**: Color separation on hover
- **Custom cursor**: Interactive cursor with trail

## Payments

### Stripe

Card payments are handled via Stripe. In production, you'll need:
1. A backend API for creating checkout sessions
2. Webhook handling for order fulfillment

### Solana Pay

Crypto payments use Solana Pay QR codes. Requires:
1. A Solana wallet for receiving payments
2. HTTPS (works on Vercel, not localhost HTTP)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## License

MIT License - feel free to use for your own NFT projects!

---

Built with love for the Primos community.
