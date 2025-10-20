import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({

  plugins: [react(),
     tailwindcss(),
  ],
   server: {
    host: '0.0.0.0',
    port: 8000, // Vite's default port
  },
  base: '/Exclusive_Eccomerce/',
})