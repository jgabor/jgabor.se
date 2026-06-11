import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const DATA_FILES = ["src/data/code-overrides.json", "src/data/career.json"];
const CONTENT_CONFIG = "src/content.config.ts";
const DATA_STORE_VIRTUAL_ID = "\0astro:data-layer-content";
const CONTENT_VIRTUAL_ID = "\0astro:content";
const DATA_STORE_DEBOUNCE_MS = 600;

const require = createRequire(import.meta.url);

function resolveAstroModule(relativePath) {
  const astroRoot = path.dirname(require.resolve("astro/package.json"));
  return pathToFileURL(path.join(astroRoot, relativePath)).href;
}

function invalidateContentModules(server) {
  const timestamp = Date.now();

  for (const envName of ["ssr", "astro", "client"]) {
    const env = server.environments?.[envName];
    if (!env) continue;

    for (const modId of [DATA_STORE_VIRTUAL_ID, CONTENT_VIRTUAL_ID]) {
      const mod = env.moduleGraph.getModuleById(modId);
      if (mod) {
        env.moduleGraph.invalidateModule(mod, undefined, timestamp, true);
      }
    }

    env.hot?.send("astro:content-changed", {});
  }

  server.environments?.client?.hot?.send({ type: "full-reload", path: "*" });
  server.ws?.send({ type: "full-reload", path: "*" });
}

function isWatchedSource(filePath, watchedSources) {
  const normalized = path.normalize(filePath);
  return watchedSources.has(normalized);
}

export function contentDataHmrPlugin() {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounce;

  return {
    name: "jgabor:content-data-hmr",
    configureServer(server) {
      const root = server.config.root;
      const watchedSources = new Set(
        [...DATA_FILES, CONTENT_CONFIG].map((file) => path.resolve(root, file)),
      );
      const dataStorePath = path.resolve(root, ".astro", "data-store.json");

      for (const file of [...watchedSources, dataStorePath]) {
        server.watcher.add(file);
      }

      const queueReload = async (changedPath) => {
        const normalized = path.normalize(changedPath);
        const isSource = isWatchedSource(normalized, watchedSources);
        const isStore = normalized === dataStorePath;

        if (!isSource && !isStore) return;

        clearTimeout(debounce);
        debounce = setTimeout(async () => {
          try {
            if (isSource) {
              const { globalContentLayer } = await import(
                resolveAstroModule("dist/content/instance.js")
              );
              const layer = globalContentLayer.get();

              if (layer) {
                if (normalized.endsWith("content.config.ts")) {
                  await layer.sync();
                } else {
                  await layer.sync({ loaders: ["file-loader"] });
                }
                await new Promise((resolve) => setTimeout(resolve, DATA_STORE_DEBOUNCE_MS));
              }
            }

            invalidateContentModules(server);
          } catch (error) {
            console.error("[jgabor:content-data-hmr]", error);
            server.ws.send({ type: "full-reload", path: "*" });
          }
        }, 50);
      };

      server.watcher.on("change", queueReload);
      server.watcher.on("add", queueReload);
    },
  };
}
