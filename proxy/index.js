import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
/* import { createServer } from "https";
import { readFileSync } from "fs"; */

const app = express();

const proxy = createProxyMiddleware({
  target: process.env.AWS_URL,
  changeOrigin: true,
});

app.use(proxy);

// Start the Express app
app.listen(3001, () => {
  console.log("Proxy server listening on port 3000");
});

//

/* const options = {
  key: readFileSync("D:/certs/local-key.pem"),
  cert: readFileSync("D:/certs/local-cert.pem"),
};
const server = createServer(options, app);
const port = 3001;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
 */
