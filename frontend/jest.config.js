const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  roots: ['<rootDir>/src', '<rootDir>/../tests/frontend'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  modulePaths: ['<rootDir>/node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/(.*)$': '<rootDir>/node_modules/next/$1',
    '^axios$': '<rootDir>/node_modules/axios',
    '^date-fns$': '<rootDir>/node_modules/date-fns',
    '^prismjs$': '<rootDir>/node_modules/prismjs',
    '^react-hot-toast$': '<rootDir>/node_modules/react-hot-toast',
    '^lucide-react$': '<rootDir>/node_modules/lucide-react',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.js',
    '!src/pages/_app.js',
    '!src/pages/_document.js',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
