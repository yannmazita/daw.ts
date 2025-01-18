/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  envDir: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
  },
});
