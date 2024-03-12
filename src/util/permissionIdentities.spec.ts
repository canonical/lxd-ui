import { LxdGroup, LxdIdentity } from "types/permissions";
import {
  getGroupsForIdentities,
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
  pivotIdentityGroupsChangeSummary,
} from "./permissionIdentities";

describe("Permissions util functions for identities page", () => {
  it("getGroupsForIdentities", () => {
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

    const {
      groupsForAllIdentities,
      groupsForSomeIdentities,
      groupsForNoIdentities,
    } = getGroupsForIdentities(groups, identities);

    expect(groupsForAllIdentities).toEqual(["group-2"]);
    expect(groupsForSomeIdentities).toEqual(["group-1"]);
    expect(groupsForNoIdentities).toEqual(["group-3"]);
  });

  it("generateGroupAllocationsForIdentities", () => {
    const addedGroups = new Set(["group-1"]);
    const removedGroups = new Set(["group-3"]);
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
    const groupsForIdentities = generateGroupAllocationsForIdentities(
      addedGroups,
      removedGroups,
      identities,
    );

    expect(groupsForIdentities).toEqual({
      "user-1": ["group-1", "group-2"],
      "user-2": ["group-2", "group-1"],
      "user-3": ["group-1"],
    });
  });

  it("getChangesInGroupsForIdentities", () => {
    // user action:
    // - remove group-1 for user-1 and user-2
    // - add group-3 and group-4 for user-1 and user-2
    const identities = [
      {
        id: "user-1",
        name: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        name: "user-2",
        groups: ["group-1"],
      },
    ] as LxdIdentity[];

    const addedGroups = new Set(["group-3", "group-4"]);
    const removedGroups = new Set(["group-1"]);

    const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
      identities,
      addedGroups,
      removedGroups,
    );

    expect(identityGroupsChangeSummary).toEqual({
      "user-1": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-1",
      },
      "user-2": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-2",
      },
    });
  });

  it("pivotIdentityGroupsChangeSummary", () => {
    const identityGroupsChangeSummary = {
      "user-1": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-1",
      },
      "user-2": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-2",
      },
    };

    const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
      identityGroupsChangeSummary,
    );

    expect(groupIdentitiesChangeSummary).toEqual({
      "group-1": {
        added: new Set(),
        removed: new Set(["user-1", "user-2"]),
        name: "group-1",
      },
      "group-3": {
        added: new Set(["user-1", "user-2"]),
        removed: new Set(),
        name: "group-3",
      },
      "group-4": {
        added: new Set(["user-1", "user-2"]),
        removed: new Set(),
        name: "group-4",
      },
    });
  });
});
