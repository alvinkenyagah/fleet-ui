import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // This is the port your frontend dev server will run on
    port: 5173,
    // Configure proxy rules here
    proxy: {
      // Any request starting with /api will be proxied
      '/api': {
        // The target backend server URL
        target: 'http://localhost:5000',
        // Change the origin of the host header to the target URL
        changeOrigin: true,
        // No rewrite needed if your backend routes already include /api
        // e.g., /api/drivers will go to http://localhost:5000/api/drivers
      },
    },
  },
})