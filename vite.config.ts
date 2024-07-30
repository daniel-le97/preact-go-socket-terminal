import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  worker: {
    format: "es",
    rollupOptions: {
      external: [/^socket:.*/],
    },
  },
  build: {
    target: "esnext",
    minify: false,
    
    
    rollupOptions: {
      input: [
        "index.html",
        // "./src/service-workers/http.ts",
        // "./src/service-workers/logto.ts",
      ],
      
      output: {
        
        entryFileNames: (chunk) => {
          if (chunk.facadeModuleId?.includes("service-workers")) {
            return `service-workers/${chunk.name}.js`;
          }
          return `assets/${chunk.name}.js`;
        },
        // 'preserveModules': true,
      },
      'preserveEntrySignatures': 'exports-only',
      external: [/^socket:.*/],
    },
  },
});
