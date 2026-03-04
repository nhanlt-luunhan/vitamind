import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "http://localhost:3333",
    "http://127.0.0.1:3333",
    "http://app.vitamind.com.vn:3333",
    "https://app.vitamind.com.vn",
  ],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
