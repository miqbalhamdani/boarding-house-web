import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // No @vitejs/plugin-react (its babel 8 peer conflicts with shadcn). Vite picks
  // up the automatic JSX runtime from tsconfig's "jsx": "react-jsx".
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080/api/v1",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
});
