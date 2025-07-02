/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactive ESLint pendant le build de production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionnel : désactive aussi TypeScript strict pendant le build
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig