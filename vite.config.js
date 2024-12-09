//import { defineConfig } from "vite";

export default {
  base: process.env.REPO_NAME || "/CMPM121-Final-Project/dist/",
  resolve: {
    extensions: [".ts", ".js"], // Ensure TypeScript and JavaScript files are resolved
  },
}