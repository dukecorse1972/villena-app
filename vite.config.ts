import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/data/**',
        'src/types/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.module.css',
      ],
      // Calibrados sobre la cobertura real medida al escribir estos tests
      // (statements 41.4%, branches 35.2%, functions 36.3%, lines 43.8% con
      // `all: true`, es decir contando también los archivos sin ningún
      // test) — un poco por debajo como suelo que detecte una regresión
      // futura, no como listón aspiracional que haya que perseguir ya.
      thresholds: {
        statements: 38,
        branches: 32,
        functions: 33,
        lines: 40,
      },
    },
  },
})
