import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Context, createContext, runInContext } from "node:vm";

const swSource = readFileSync(
  resolve(__dirname, "../../public/sw.js"),
  "utf-8"
);

describe("service worker configuration", () => {
  let catchHandler:
    | ((args: {
        event: { request: { destination: string } };
      }) => Promise<unknown>)
    | undefined;
  let registeredRoutes: Array<{
    match: (context: {
      url: URL;
      request: { method: string; destination?: string };
    }) => boolean;
    strategy: { options: { plugins?: Array<unknown>; [key: string]: unknown } };
    method?: string;
  }> = [];
  const NetworkFirst = class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
  };
  const StaleWhileRevalidate = class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
  };
  const CacheFirst = class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
  };
  const NetworkOnly = class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
  };
  const BackgroundSyncPlugin = class {
    name: string;
    options: Record<string, unknown>;
    constructor(name: string, options: Record<string, unknown>) {
      this.name = name;
      this.options = options;
    }
  };
  const CacheableResponsePlugin = class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
  };
  const ExpirationPlugin = class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
  };

  const workboxStub = {
    precaching: {
      precacheAndRoute: vi.fn(),
      cleanupOutdatedCaches: vi.fn(),
      matchPrecache: vi.fn(async (url: string) => url),
    },
    routing: {
      registerRoute: vi.fn(
        (
          match: (context: {
            url: URL;
            request: { method: string; destination?: string };
          }) => boolean,
          strategy: { options: Record<string, unknown> },
          method?: string
        ) => {
          registeredRoutes.push({ match, strategy, method });
        }
      ),
      setCatchHandler: vi.fn((handler) => {
        catchHandler = handler;
      }),
    },
    strategies: {
      NetworkFirst,
      StaleWhileRevalidate,
      CacheFirst,
      NetworkOnly,
    },
    backgroundSync: {
      BackgroundSyncPlugin,
    },
    cacheableResponse: {
      CacheableResponsePlugin,
    },
    expiration: {
      ExpirationPlugin,
    },
    core: {
      setCacheNameDetails: vi.fn(),
      skipWaiting: vi.fn(),
      clientsClaim: vi.fn(),
    },
  };

  beforeEach(() => {
    registeredRoutes = [];
    catchHandler = undefined;
    workboxStub.precaching.matchPrecache.mockClear();
    workboxStub.routing.registerRoute.mockClear();
    workboxStub.routing.setCatchHandler.mockClear();

    const context = {
      self: {
        workbox: workboxStub,
        __WB_MANIFEST: [],
        addEventListener: vi.fn(),
        skipWaiting: vi.fn(),
      },
      importScripts: vi.fn(),
      console,
      Response,
    } as unknown as Context;

    createContext(context);
    runInContext(swSource, context);
  });

  it("returns offline.html when navigation fails", async () => {
    expect(catchHandler).toBeTypeOf("function");
    const result = await catchHandler!({
      event: {
        request: { destination: "document" },
      },
    });

    expect(result).toBe("/offline.html");
  });

  it("returns image fallback for failed image requests", async () => {
    const result = await catchHandler!({
      event: {
        request: { destination: "image" },
      },
    });

    expect(result).toBe("/images/fallback.png");
  });

  it("uses NetworkFirst strategy with timeout for API requests", () => {
    const apiRoute = registeredRoutes.find((route) =>
      route.match({
        url: new URL("https://litenkod.se/api/data"),
        request: { method: "GET" },
      })
    );

    expect(apiRoute).toBeDefined();
    expect(apiRoute?.strategy).toBeInstanceOf(NetworkFirst);

    const options = apiRoute?.strategy.options;
    expect(options?.networkTimeoutSeconds).toBe(3);

    const cacheablePlugin = options?.plugins?.find(
      (plugin: unknown) => plugin instanceof CacheableResponsePlugin
    );
    expect(cacheablePlugin?.options.statuses).toEqual([0, 200]);

    const expirationPlugin = options?.plugins?.find(
      (plugin: unknown) => plugin instanceof ExpirationPlugin
    );
    expect(expirationPlugin?.options.maxAgeSeconds).toBe(600);
    expect(expirationPlugin?.options.maxEntries).toBe(50);
  });
});
