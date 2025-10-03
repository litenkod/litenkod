import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SW_URL = "/sw.js";

function setServiceWorkerMocks(registerImpl: () => Promise<unknown>) {
  const register = vi.fn(registerImpl);
  const addEventListener = vi.fn();

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      register,
      addEventListener,
      controller: {},
    },
  });

  return { register, addEventListener };
}

describe("register-sw", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
  });

  it("registers the service worker when the window has loaded", async () => {
    const { register } = setServiceWorkerMocks(async () => ({
      waiting: null,
      addEventListener: vi.fn(),
    }));

    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    await import("../../register-sw.js");
    const loadHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "load")?.[1] as () => void;

    expect(loadHandler).toBeTypeOf("function");
    loadHandler();
    await Promise.resolve();

    expect(register).toHaveBeenCalledWith(SW_URL);
  });

  it("prompts for updates and skips waiting workers", async () => {
    const waitingWorker = { postMessage: vi.fn() };
    const registration = {
      waiting: waitingWorker,
      addEventListener: vi.fn(),
    };
    const { register, addEventListener: swAddEventListener } = setServiceWorkerMocks(
      async () => registration
    );

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    await import("../../register-sw.js");
    const loadHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "load")?.[1] as () => void;
    expect(loadHandler).toBeTypeOf("function");

    loadHandler();
    await Promise.resolve();

    expect(register).toHaveBeenCalledWith(SW_URL);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "sw:update", detail: waitingWorker })
    );
    expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });

    const controllerHandler = swAddEventListener.mock.calls.find(([event]) => event === "controllerchange")?.[1];
    expect(controllerHandler).toBeTypeOf("function");
  });
});
