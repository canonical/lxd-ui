import type { LxdInstance } from "types/instance";
import { isAgentLikelyMissing } from "./instanceTerminal";

const startedAt = "2026-01-01T10:00:00Z";
const thirtySecondsAfterStart = new Date("2026-01-01T10:00:30Z").getTime();
const fiveMinutesAfterStart = new Date("2026-01-01T10:05:00Z").getTime();

const asInstance = (
  type: LxdInstance["type"],
  status: LxdInstance["status"],
  processes: number,
) =>
  ({
    type,
    status,
    last_used_at: startedAt,
    state: { processes },
  }) as unknown as LxdInstance;

describe("isAgentLikelyMissing", () => {
  it("is true for a running vm without processes a while after start", () => {
    const vm = asInstance("virtual-machine", "Running", -1);

    expect(isAgentLikelyMissing(vm, fiveMinutesAfterStart)).toBe(true);
  });

  it("is false right after the vm was started", () => {
    const vm = asInstance("virtual-machine", "Running", -1);

    expect(isAgentLikelyMissing(vm, thirtySecondsAfterStart)).toBe(false);
  });

  it("is false once the agent reports processes", () => {
    const vm = asInstance("virtual-machine", "Running", 42);

    expect(isAgentLikelyMissing(vm, fiveMinutesAfterStart)).toBe(false);
  });

  it("is false for a stopped vm", () => {
    const vm = asInstance("virtual-machine", "Stopped", -1);

    expect(isAgentLikelyMissing(vm, fiveMinutesAfterStart)).toBe(false);
  });

  it("is false for containers", () => {
    const container = asInstance("container", "Running", 0);

    expect(isAgentLikelyMissing(container, fiveMinutesAfterStart)).toBe(false);
  });
});
