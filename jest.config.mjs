export default {
  clearMocks: true,
  coverageDirectory: "coverage",
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    "**/tests/unit/**/*.test.js",
    "**/tests/integration/**/*.test.js"
  ],
  // Additional configuration...
};