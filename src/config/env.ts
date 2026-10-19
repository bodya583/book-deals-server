export const isMockMode =
  process.argv.includes('--mock') || process.env.USE_MOCK_DATA === 'true';
