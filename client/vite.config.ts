import { defineConfig } from 'vite'
import pkg from '../package.json' with { type: 'json' };
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  }
})
