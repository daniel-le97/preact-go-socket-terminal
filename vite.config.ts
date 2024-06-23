import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path'

// import childProcess from 'node:child_process'

// childProcess.exec('ls', () => {}, )

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build:{
    rollupOptions:{
      external: [/^socket:.*/]
    }
  },
})
