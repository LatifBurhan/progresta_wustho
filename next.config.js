/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pkjghohbvfzhdryaupe.supabase.co'],
  },
}

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA(nextConfig)