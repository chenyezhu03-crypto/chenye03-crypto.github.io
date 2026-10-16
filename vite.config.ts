import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/** `./` + 单文件内联：生成可双击用浏览器打开的 index.html（无需 localhost） */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    cssCodeSplit: false,
  },
})
