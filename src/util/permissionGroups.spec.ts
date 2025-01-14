import type { LxdGroup, LxdIdentity } from "types/permissions";
import {
  getCurrentIdentitiesForGroups,
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
} from "./permissionGroups";

describe("Permissions util functions for groups page", () => {
  it("getCurrentIdentitiesForGroups", () => {
    const groups = [
      {
        name: "group-1",
      },
      {
        name: "group-2",
      },
      {
        name: "group-3",
      },
    ] as LxdGroup[];

    const identities = [
      {
        id: "user-1",
        groups: ["group-1", "group-2", "group-3"],
      },
      {
        id: "user-2",
        groups: ["group-1"],
      },
      {
        id: "user-3",
        groups: [],
      },
    ] as LxdIdentity[];

    const {
      identityIdsInAllGroups,
      identityIdsInSomeGroups,
      identityIdsInNoGroups,
    } = getCurrentIdentitiesForGroups(groups, identities);

    expect(identityIdsInAllGroups).toEqual(["user-1"]);
    expect(identityIdsInSomeGroups).toEqual(["user-2"]);
    expect(identityIdsInNoGroups).toEqual(["user-3"]);
  });

  it("generateGroupAllocationsForIdentities", () => {
    const addedIdentities = new Set(["user-3"]);
    const removedIdentities = new Set(["user-1", "user-2"]);
    const selectedGroups = [
      {
        name: "group-1",
      },
      {
        name: "group-2",
      },
    ] as LxdGroup[];
    const addedOrRemovedIdentities = [
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
      addedIdentities,
      removedIdentities,
      selectedGroups,
      addedOrRemovedIdentities,
    );

    expect(groupsForIdentities).toEqual({
      "user-1": [],
      "user-2": [],
      "user-3": ["group-3", "group-1", "group-2"],
    });
  });

  it("getChangesInGroupsForIdentities", () => {
    // user action:
    // - remove user-1 from group-1 and group-2
    // - add user-2 and user-3 to group-1 and group-2
    const allIdentities = [
      {
        id: "user-1",
        name: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        name: "user-2",
        groups: ["group-3", "group-4"],
      },
      {
        id: "user-3",
        name: "user-3",
        groups: ["group-2"],
      },
    ] as LxdIdentity[];

    const addedIdentities = new Set(["user-2", "user-3"]);
    const removedIdentities = new Set(["user-1"]);

    const selectedGroups = [
      {
        name: "group-1",
      },
      {
        name: "group-2",
      },
    ] as LxdGroup[];

    const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
      allIdentities,
      selectedGroups,
      addedIdentities,
      removedIdentities,
    );

    expect(identityGroupsChangeSummary).toEqual({
      "user-1": {
        added: new Set([]),
        removed: new Set(["group-1", "group-2"]),
        name: "user-1",
      },
      "user-2": {
        added: new Set(["group-1", "group-2"]),
        removed: new Set([]),
        name: "user-2",
      },
      "user-3": {
        added: new Set(["group-1"]),
        removed: new Set([]),
        name: "user-3",
      },
    });
  });
});
