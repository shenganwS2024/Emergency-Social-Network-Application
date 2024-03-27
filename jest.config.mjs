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
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/config/",
    "/searchStrategies/",
    "server.js",
    "/models/Messages.js",
    "/controllers/switchStateController.js",
    "/controllers/announcementController.js",
    "/controllers/publicChatController.js",
  ],
};