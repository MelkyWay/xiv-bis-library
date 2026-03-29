import { afterEach, beforeEach, vi } from "vitest";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  const storage = createMemoryStorage();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage
  });

  Object.defineProperty(globalThis.window, "localStorage", {
    configurable: true,
    value: storage
  });

  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  });

  Object.defineProperty(globalThis.window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      font: "",
      measureText: (text: string) => ({ width: text.length * 9 })
    }))
  });
});

afterEach(() => {
  globalThis.localStorage.clear();
  document.documentElement.removeAttribute("lang");
  delete document.documentElement.dataset.theme;
});
