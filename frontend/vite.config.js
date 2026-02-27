import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-animation": ["framer-motion"],
            "vendor-ui": ["react-toastify", "lucide-react"],
          },
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3003/api",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
