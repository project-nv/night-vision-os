import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import viteRawPlugin from "./vite/vite-raw-plugin.js";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/renderer",
  plugins: [
    svelte({
      emitCss: false,
    }),
    viteRawPlugin({
      fileRegex: /\.navy|\.txt$/,
    }),
  ],
  server: {
    port: 16888,
  },
  build: {
    target: "es2018"
  }
});
