/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@faker-js/faker|@supabase|zod|uuid)/)",
  ],
};
