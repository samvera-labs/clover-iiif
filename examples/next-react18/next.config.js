/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  // Ensure the example and the linked package share a single React instance
  // when installed via `file:../..` during local development.
  transpilePackages: ['@samvera/clover-iiif'],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client'),
    };
    return config;
  },
};

module.exports = nextConfig;
