import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: '/admin/',
  plugins: [react(), basicSsl()],
  server: { port: 4000 },
  build: { outDir: 'dist' },
})
