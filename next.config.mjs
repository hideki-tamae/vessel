/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 審美眼に基づくヘッダー設定：セキュリティと開発効率の統合
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.walletconnect.com https://*.google.com; object-src 'none';",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

export default nextConfig;