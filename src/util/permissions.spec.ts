import { LxdGroup, LxdIdentity } from "types/permissions";
import {
  getCurrentGroupAllocationsForIdentities,
  generateGroupAllocationsForIdentities,
} from "./permissions";

describe("Permissions util functions", () => {
  it("getCurrentGroupAllocationsForIdentities", () => {
    const groups = [
      {
        name: "group-1",
        identities: {
          oidc: ["user-1"],
          tls: ["user-2"],
        },
      },
      {
        name: "group-2",
        identities: {
          oidc: ["user-1", "user-3"],
          tls: ["user-2"],
        },
      },
      {
        name: "group-3",
        identities: {
          oidc: [],
          tls: [],
        },
      },
    ] as LxdGroup[];

    const identities = [
      {
        id: "user-1",
      },
      {
        id: "user-2",
      },
      {
        id: "user-3",
      },
    ] as LxdIdentity[];

    const { groupsAllocatedToAllIdentities, groupsAllocatedToSomeIdentities } =
      getCurrentGroupAllocationsForIdentities(groups, identities);

    expect(groupsAllocatedToAllIdentities).toEqual(["group-2"]);
    expect(groupsAllocatedToSomeIdentities).toEqual(["group-1"]);
  });

  it("generateGroupAllocationsForIdentities", () => {
    const groupsForAllIdentities = ["group-1"];
    const groupsForSomeIdentities = ["group-2"];
    const identities = [
      {
        id: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        groups: ["group-2"],
      },
      {
        id: "user-3",
        groups: ["group-3"],
      },
    ] as LxdIdentity[];
    const groupsForIdentities = generateGroupAllocationsForIdentities({
      groupsForAllIdentities,
      groupsForSomeIdentities,
      identities,
    });

    expect(groupsForIdentities).toEqual({
      "user-1": ["group-1", "group-2"],
      "user-2": ["group-1", "group-2"],
      "user-3": ["group-1"],
    });
  });
});
