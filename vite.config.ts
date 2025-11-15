import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
       key: './192.168.1.44-key.pem',
    cert: './192.168.1.44.pem'
    },
        host: '192.168.1.44', // 👈 gör att dev-servern blir nåbar från andra enheter (t.ex. Android)
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://exoplanethunter.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})