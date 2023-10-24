module.exports = {
  roots: ['<rootDir>/lib'],
  transform: {
    '^.+\\.ts$': ['ts-jest']
  },
  testRegex: '/lib/.*\.(test|spec)\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
