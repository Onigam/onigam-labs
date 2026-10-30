import { defineConfig } from 'vitest/config';

// The site lives at the root of its own domain, so asset paths are absolute (the English page is /en/).
export default defineConfig({
  base: '/',
  build: { target: 'es2022' },
  test: { include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
});
