module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/index.js",
    "!src/config/**",
    "!src/migrations/**",
    "!src/seeders/**",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 10000,
};
