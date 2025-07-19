const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
    configure: (webpackConfig, { env, paths }) => {
      // Optimize bundle size
      if (env === 'production') {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                maxSize: 244000,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                enforce: true,
              },
            },
          },
        };
      }

      // Add support for service worker
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": false,
        "stream": false,
        "buffer": false,
      };

      // Configure asset handling
      webpackConfig.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      });

      // Handle Arabic fonts specifically
      webpackConfig.module.rules.push({
        test: /\.(ttf|woff|woff2)$/,
        include: [
          path.resolve(__dirname, 'src/assets/fonts'),
        ],
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        },
      });

      return webpackConfig;
    },
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    // Enable hot reload for better development experience
    hot: true,
    liveReload: true,
    // Handle client-side routing
    historyApiFallback: {
      disableDotRule: true,
    },
    // Proxy API calls to backend during development
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    } : undefined,
  },
  babel: {
    plugins: [
      // Add any Babel plugins you need
      ...(process.env.NODE_ENV === 'production' ? [
        ['transform-remove-console', { exclude: ['error', 'warn'] }]
      ] : []),
    ],
    presets: [
      ['@babel/preset-react', {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: '@emotion/react',
      }],
    ],
  },
  eslint: {
    enable: true,
    mode: 'extends',
    configure: {
      extends: [
        'react-app',
        'react-app/jest',
      ],
      rules: {
        // Customize ESLint rules
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off', // Since we're using TypeScript-style PropTypes
      },
    },
  },
  typescript: {
    enableTypeChecking: false, // Since we're using JavaScript
  },
  plugins: [
    // PWA plugin configuration
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          // Ensure service worker is properly handled
          if (process.env.NODE_ENV === 'production') {
            webpackConfig.plugins.push(
              new (require('webpack').DefinePlugin)({
                'process.env.GENERATE_SOURCEMAP': JSON.stringify('false'),
              })
            );
          }
          return webpackConfig;
        },
      },
    },
  ],
  jest: {
    configure: {
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
        '^.+\\.css$': 'jest-transform-css',
      },
      moduleFileExtensions: ['js', 'jsx', 'json'],
      collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/index.js',
        '!src/serviceWorker.js',
        '!src/**/*.test.{js,jsx}',
      ],
    },
  },
};
