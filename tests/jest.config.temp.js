/**
 * Jest Configuration for Config Validation Tests
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/e2e/config.spec.js'],
  testTimeout: 30000,
  verbose: true
};
