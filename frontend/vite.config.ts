import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    nodePolyfills({ globals: { Buffer: true } }),
  ],
  preview: {
    host: true,
    strictPort: true,
    port: 3000,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          chakra: [
            "@chakra-ui/anatomy",
            "@chakra-ui/react",
            "@chakra-ui/shared-utils",
            "@chakra-ui/styled-system",
            "@chakra-ui/theme-tools",
            "@emotion/react",
            "@emotion/styled",
          ],
          ["wallet-kit"]: [
            "@terra-money/wallet-kit",
            "@terra-money/feather.js",
          ],
        },
      },
    },
  },
});
