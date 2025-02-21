module.exports = {
  // ... другие настройки Jest
  globalSetup: './jest.setup.js',
  globalTeardown: './jest.teardown.js',
  testEnvironment: 'node',
  testTimeout: 10000, // 10 секунд
}
