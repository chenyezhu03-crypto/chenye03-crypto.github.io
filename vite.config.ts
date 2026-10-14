import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub user site: https://<user>.github.io → base must be '/'
export default defineConfig({
  plugins: [react()],
  base: '/',
})
