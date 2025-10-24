const { createDefaultPreset } = require("ts-jest");

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/tests/**/*.test.ts', '**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false
    }]
  },
};