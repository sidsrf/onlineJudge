import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /* server: {
    https: {
      key: "D:/certs/local-key.pem",
      cert: "D:/certs/local-cert.pem",
    }, */
  //   host: "0.0.0.0",
  // },
});
