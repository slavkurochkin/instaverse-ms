global.localStorage = {
  getItem: jest.fn(() => JSON.stringify({ token: 'abc123xyz' })),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
