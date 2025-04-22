/** @type {import('next').NextConfig} */
// next.config.js
import nextpwa from "next-pwa";

const withPWA = nextpwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = withPWA({});

export default nextConfig;
