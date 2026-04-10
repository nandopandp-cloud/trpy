# Media Engine Setup Guide

## Overview

The Media Engine integrates **Unsplash** (images) and **Pexels** (images + videos) to automatically enrich trips with beautiful cover images and provide a media gallery experience.

## Local Development

### 1. Get API Keys

- **Unsplash**: https://unsplash.com/oauth/applications
  - Create a new app
  - Copy the **Access Key**
  
- **Pexels**: https://www.pexels.com/api/
  - Create a new app
  - Copy the **API Key**

### 2. Add to `apps/web/.env.local`

```bash
UNSPLASH_ACCESS_KEY="your_unsplash_key_here"
PEXELS_API_KEY="your_pexels_key_here"
```

### 3. Restart dev server

```bash
pnpm --filter web dev
```

### 4. Test the API

```bash
# Images
curl "http://localhost:3000/api/media/images?query=paris&perPage=12"

# Videos
curl "http://localhost:3000/api/media/videos?query=paris&perPage=10"
```

You should see results from both providers, interleaved and deduplicated.

---

## Production (Vercel)

### 1. Add Environment Variables

Go to **Vercel Dashboard** → Project Settings → **Environment Variables**

Add:
- `UNSPLASH_ACCESS_KEY` = your key
- `PEXELS_API_KEY` = your key

Make sure to set them for **all environments** (Production, Preview, Development).

### 2. Redeploy

Trigger a redeployment so the new env vars are loaded.

### 3. Verify

Once deployed, test:
```bash
curl "https://your-domain.vercel.app/api/media/images?query=paris"
```

---

## How It Works

### Auto Trip Enrichment

When a user creates a trip **without** providing a cover image:

1. Backend captures the destination
2. Calls `getBestCoverImage(destination)`
3. Media Engine runs smart-query expansion:
   - `"Tokyo"` → `"Tokyo"`, `"Tokyo travel"`, `"Tokyo landmarks"`, `"Tokyo aesthetic"`
4. Fan-out to Unsplash + Pexels in parallel
5. Merge, dedupe, rank by source (Unsplash preferred)
6. Pick the best landscape orientation image
7. Save `trip.coverImage = url`

**Important**: Failures on the media provider **never** block trip creation. If APIs are down, the trip is still created with `coverImage = null`.

### Frontend Components

```tsx
import { MediaGallery, TripCover, useMediaImages } from '@/components/integrations/media';

// Gallery with tabs (images + videos)
<MediaGallery query="Paris" kind="both" />

// Trip cover with fallback gradient
<TripCover src={trip.coverImage} destination={trip.destination} />

// Custom hook for images
const { data, isLoading } = useMediaImages({ query: 'Bali', perPage: 12 });
```

### Caching

- **Backend**: 24-hour in-memory TTL cache per unique query
- **Frontend**: 1-hour React Query stale time (backend already cached)
- Cache is **per-destination**, so multiple users benefit from the same lookup

---

## Troubleshooting

### API returns empty `items: []`

**Check**: Are `UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` set in `apps/web/.env.local`?

```bash
# This should show both keys (at least partially)
grep -E "UNSPLASH|PEXELS" apps/web/.env.local
```

**Fix**: Add them and **restart** the dev server.

### Images load but no videos

The `PEXELS_API_KEY` may only have **free tier** access. Free tier supports images but might have video limitations. Check your Pexels dashboard.

### Caching too aggressive

The backend caches for 24h. To bypass during development:

```bash
# Clear the cache by restarting the server
pkill -f "next.*dev"
pnpm --filter web dev
```

In-memory cache is process-scoped, so it resets on restart.

---

## Architecture

```
lib/integrations/media/
├── types.ts              # Unified MediaItem type
├── cache.ts              # In-memory TTL cache (24h)
├── query-builder.ts      # Smart query expansion
├── unsplash.ts           # Unsplash provider
├── pexels.ts             # Pexels provider
└── media-service.ts      # Orchestration + ranking

app/api/media/
├── images/route.ts       # GET /api/media/images?query=...
└── videos/route.ts       # GET /api/media/videos?query=...

components/integrations/media/
├── use-media.ts          # React Query hooks
├── image-card.tsx        # Single image with lazy loading
├── video-card.tsx        # Single video with autoplay-on-hover
├── media-gallery.tsx     # Full gallery with tabs + lightbox
└── trip-cover.tsx        # Trip hero with fallback gradient
```

---

## Future Improvements

- [ ] Redis cache (replace in-memory)
- [ ] Add Pixabay provider
- [ ] AI-powered image ranking (CLIP embeddings)
- [ ] User-uploaded images
- [ ] Download & serve media locally (avoid third-party CDNs)
