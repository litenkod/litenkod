import { vi } from "vitest";

vi.stubGlobal("confirm", vi.fn(() => true));
