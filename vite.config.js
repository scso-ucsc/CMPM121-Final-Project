//import { defineConfig } from "vite";

export default {
  base: process.env.REPO_NAME || "/repo-name/",
  resolve: {
    extensions: [".ts", ".js"], // Ensure TypeScript and JavaScript files are resolved
  },
}
