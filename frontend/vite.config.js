import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBase = env.VITE_API_URL ? env.VITE_API_URL.replace(/\/+$/, '') : ''
  const apiTarget = rawBase || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Chuyển tiếp tất cả các yêu cầu bắt đầu bằng /api đến backend server
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})