/**
 * Jest Configuration for Doghead-Advisor E2E Tests
 */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/e2e/**/*.spec.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    'pages/**/*.js',
    'cloudfunctions/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/']
};
