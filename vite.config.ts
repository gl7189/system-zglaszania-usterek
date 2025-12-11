import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Definiujemy stałą globalną dostępną w aplikacji
    // Używamy JSON.stringify aby przekazać wartość jako string, z fallbackiem do 'development'
    '__VERCEL_ENV__': JSON.stringify(process.env.VERCEL_ENV || 'development'),
  },
})