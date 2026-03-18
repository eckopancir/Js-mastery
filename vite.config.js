import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Объединяем всё в один конфиг
export default defineConfig({
  base: '/Js-mastery/', 
  plugins: [react()],
})
