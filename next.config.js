/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 배포 최적화 설정
  reactStrictMode: false,
  
  // 이미지 최적화 설정
  images: {
    unoptimized: false,
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 번들 분석 및 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 번들 크기 최적화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 모달 관련 코드를 별도 청크로 분리
          modals: {
            name: 'modals',
            chunks: 'all',
            test: /[\\/]components[\\/](.*Modal|.*Dialog)[\\/]/,
            priority: 20,
          },
          // UI 컴포넌트를 별도 청크로 분리
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]components[\\/]ui[\\/]/,
            priority: 15,
          },
          // 라이브러리를 별도 청크로 분리
          lib: {
            name: 'lib',
            chunks: 'all',
            test: /[\\/]lib[\\/]/,
            priority: 10,
          },
          // 외부 라이브러리
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 5,
          },
        },
      };
    }
    
    return config;
  },
  
  // 실험적 기능 설정
  experimental: {
    optimizeCss: false,
  },
  
  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // PWA 및 정적 파일 헤더 설정
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // 환경별 설정
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // 출력 설정 (Vercel에서는 자동 처리)
  // output: 'standalone',
  
  // TypeScript 설정
  typescript: {
    // 빌드 시 타입 에러 무시 (필요시)
    ignoreBuildErrors: false,
  },
  
  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 에러 무시 (필요시)
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
