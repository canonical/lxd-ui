import {
  getClusterLeader,
  getClusterMemberStatusCounts,
  getClusterMemberStatusIconName,
} from "util/clusterMember";
import type { LxdClusterMember } from "types/cluster";

const createMember = (
  overrides: Partial<LxdClusterMember>,
): LxdClusterMember => ({
  architecture: "x86_64",
  database: false,
  description: "",
  failure_domain: "default",
  message: "fully operational",
  roles: [],
  server_name: "member1",
  status: "Online",
  url: "https://127.0.0.1:8443",
  ...overrides,
});

describe("getClusterLeader", () => {
  it("returns the member with the database-leader role", () => {
    const leader = createMember({
      server_name: "leader",
      roles: ["database-leader", "database"],
    });
    const members = [createMember({ server_name: "member2" }), leader];

    expect(getClusterLeader(members)).toBe(leader);
  });

  it("returns undefined when no member has the database-leader role", () => {
    const members = [
      createMember({ server_name: "member1", roles: ["database"] }),
      createMember({ server_name: "member2" }),
    ];

    expect(getClusterLeader(members)).toBeUndefined();
  });

  it("returns undefined for an empty list", () => {
    expect(getClusterLeader([])).toBeUndefined();
  });

  it("handles members without roles", () => {
    const members = [createMember({ roles: undefined })];

    expect(getClusterLeader(members)).toBeUndefined();
  });
});

describe("getClusterMemberStatusCounts", () => {
  it("counts members by status", () => {
    const members = [
      createMember({ status: "Online" }),
      createMember({ status: "Online" }),
      createMember({ status: "Offline" }),
      createMember({ status: "Blocked" }),
    ];

    expect(getClusterMemberStatusCounts(members)).toEqual({
      Online: 2,
      Offline: 1,
      Blocked: 1,
    });
  });

  it("returns an empty object for an empty list", () => {
    expect(getClusterMemberStatusCounts([])).toEqual({});
  });
});

describe("getClusterMemberStatusIconName", () => {
  it.each([
    ["Evacuated", "status-queued-small"],
    ["Online", "status-succeeded-small"],
    ["Offline", "status-failed-small"],
    ["Blocked", "status-waiting-small"],
  ] as const)("maps %s to %s", (status, expected) => {
    expect(getClusterMemberStatusIconName(status)).toBe(expected);
  });
});
