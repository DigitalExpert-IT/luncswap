import { config } from "dotenv";
import path from "path";
import express from "express";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ViteDevServer } from "vite";
import compression from "compression";
import serveStatic from "serve-static";

config();

const isDev = process.env.NODE_ENV !== "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolve = (p: string) => path.resolve(__dirname, p);

let vite: ViteDevServer;

// create script to inject env within window.__PUBLIC_ENV__ object
// filter only env with prefix PUBLIC_
// this env will be injected into window object
const compileEnvScript = () => {
  const instructionList: string[] = ["window.__PUBLIC_ENV__ = {};"];
  Object.keys(process.env).forEach(key => {
    if (key.startsWith("PUBLIC_")) {
      instructionList.push(
        `window.__PUBLIC_ENV__["${key}"] = "${process.env[key]}";`,
      );
    }
  });
  return `<script>${instructionList.reduce(
    (acc, val) => acc + "\n" + val,
    "",
  )}</script>`;
};

const compileHTML = (() => {
  let cache = "";
  return async (url: string) => {
    if (cache !== "") return cache;
    const injectedScript = compileEnvScript();

    if (isDev) {
      const html = resolve("./index.html");
      const htmlString = await fs.readFile(html, { encoding: "utf-8" });
      const compiledHTMLString = htmlString.replace(
        "%injectedScript%",
        injectedScript,
      );
      const result = await vite.transformIndexHtml(url, compiledHTMLString);
      cache = result;
      return result;
    } else {
      const html = resolve("./dist/index.html");
      const htmlString = await fs.readFile(html, { encoding: "utf-8" });
      const result = htmlString.replace("%injectedScript%", injectedScript);
      cache = result;
      return result;
    }
  };
})();

const createServer = async () => {
  const app = express();
  app.use(express.static(resolve("public")));

  if (isDev) {
    const { createServer } = await import("vite");
    vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    app.use(compression());
    app.use(serveStatic(resolve("dist"), { index: false }));
  }

  app.get("*", async (req, res) => {
    const url = req.originalUrl;
    const htmlString = await compileHTML(url);
    res.status(200).set({ "Content-Type": "text/html" }).end(htmlString);
  });

  const port = process.env.PORT || 3000;
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Listening on http://localhost:${port}`);
  });
};

createServer();
