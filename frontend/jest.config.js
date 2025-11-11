module.exports = {
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  moduleFileExtensions: ['js', 'jsx'],
  testEnvironment: 'node',
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: 'coverage', // Directory to output coverage reports
  coverageReporters: ['html', 'text'], // Generate HTML and text coverage reports
  collectCoverageFrom: [
    'src/**/*.{js,jsx}', // Include all JS and JSX files in src
    '!src/**/*.test.{js,jsx}', // Exclude test files
    '!src/index.js', // Exclude entry point if not needed
    '!src/**/styles.js', // Exclude specific files like styles
  ],
};
