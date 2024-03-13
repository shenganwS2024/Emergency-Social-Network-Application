export default {
  clearMocks: true,
  coverageDirectory: "coverage",
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    "**/test/**/*.js",
  ],
  // Additional configuration...
};