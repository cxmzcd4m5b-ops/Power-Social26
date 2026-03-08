/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@ffmpeg-installer/ffmpeg',
      '@ffprobe-installer/ffprobe',
      'fluent-ffmpeg',
    ],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    // Prevent bundler from parsing .md files in node_modules (e.g. ffprobe README)
    config.module.rules.push({
      test: /\.md$/,
      include: /node_modules/,
      use: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
