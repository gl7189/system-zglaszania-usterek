import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // To pozwala używać process.env.VERCEL_ENV w kodzie Reacta
    // Vercel ustawia to automatycznie na 'production', 'preview' lub 'development'
    'import.meta.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV),
  },
})