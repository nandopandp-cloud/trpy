/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  headers: async () => [
    {
      source: '/api/place-photo',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200' },
      ],
    },
    {
      source: '/api/destination-photo',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600' },
      ],
    },
    {
      source: '/api/recommendations',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=1800' },
      ],
    },
    {
      source: '/api/videos/search',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600' },
      ],
    },
    {
      source: '/api/places/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=1800' },
      ],
    },
    {
      source: '/api/pexels-photos',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600' },
      ],
    },
    {
      source: '/api/media/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600' },
      ],
    },
  ],
};

export default nextConfig;
