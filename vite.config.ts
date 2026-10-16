import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** `./` 便于 dist/index.html 双击用浏览器直接打开（file:// + Hash 路由） */
export default defineConfig({
  plugins: [react()],
  base: './',
})
