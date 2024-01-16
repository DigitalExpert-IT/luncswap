// import type { Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import compression from "compression";
import serveStatic from "serve-static";
import express from "express";

const isDev = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolve = (p: string) => path.resolve(__dirname, p);

const getStyleSheets = async () => {
  try {
    const assetpath = resolve("public");
    const file = await fs.readdir(assetpath);
    const cssAssets = file.filter(l => l.endsWith(".css"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allContent: any = [];
    for (const asset of cssAssets) {
      const content = await fs.readFile(path.join(assetpath, asset), "utf-8");
      allContent.push(`<style type="text/css">${content}</style>`);
    }
    return allContent.join("\n");
  } catch (e) {
    console.log(e);
  }
};

const createServer = async (isProd = process.env.NODE_ENV === "production") => {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: isDev ? "error" : "info",
    root: isProd ? "dist" : "",
    optimizeDeps: { include: [] },
  });
  app.use(vite.middlewares);
  const assetsDir = resolve("public");
  const requestHandler = express.static(assetsDir);
  app.use(requestHandler);
  app.use("/public", requestHandler);

  if (isProd) {
    app.use(compression());
    app.use(
      serveStatic(resolve("client"), {
        index: false,
      }),
    );
  }
  const stylesheets = getStyleSheets();
  console.log(stylesheets);
};

createServer();
