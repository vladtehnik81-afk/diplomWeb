import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Изменили импорт здесь

export default defineConfig({
  plugins: [react()],
})