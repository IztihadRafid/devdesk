import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30000,
    env: {
      MONGODB_URI: "mongodb://placeholder-not-used-in-tests",
    },
  },
});