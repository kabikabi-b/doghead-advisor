/**
 * Jest Configuration - Doghead Advisor
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/utils/init.js'],
  testTimeout: 30000,
  verbose: true
};