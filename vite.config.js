import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.VITE_SINGLEFILE === '1'

export default defineConfig({
  plugins: isSingleFile ? [react(), viteSingleFile()] : [react()],
  base: isSingleFile ? './' : '/bacterial-unknown-identification/',
  build: isSingleFile
    ? { rollupOptions: { output: { inlineDynamicImports: true } } }
    : {},
})
