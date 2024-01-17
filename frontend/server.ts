import path from "path";
import express from "express";
// import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import compression from "compression";
import serveStatic from "serve-static";

const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.VITE_DEV_SERVER === "true";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolve = (p: string) => path.resolve(__dirname, p);

const createServer = async () => {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    logLevel: isDev ? "error" : "info",
    root: resolve("."),
  });

  app.use(vite.middlewares);

  if (isDev) {
    app.use(express.static(resolve("public")));
  } else {
    app.use(compression());
    app.use(serveStatic(resolve("dist"), { index: false }));
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Listening on http://localhost:${port}`);
  });
};

createServer();
