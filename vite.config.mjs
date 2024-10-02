import { defineConfig } from "vite";
import { resolve } from "path";
import { devDependencies, peerDependencies } from "./package.json";
export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      name: "everythingToEverywhere",
    },
    rollupOptions: {
      external: [...Object.keys(devDependencies), ...Object.keys(peerDependencies)],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
