import type * as Yup from "yup";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import type { LxdGroup, LxdIdentity } from "types/permissions";
import type { ChangeSummary } from "./permissionIdentities";

export const testDuplicateGroupName = (
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, Yup.TestFunction<string | undefined, Yup.AnyObject>] => {
  return [
    "deduplicate",
    "A group with this name already exists",
    async (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(value, "", controllerState, "auth/groups")
      );
    },
  ];
};

export const getCurrentIdentitiesForGroups = (
  groups: LxdGroup[],
  identities: LxdIdentity[],
): {
  identityIdsInAllGroups: string[];
  identityIdsInSomeGroups: string[];
  identityIdsInNoGroups: string[];
} => {
  const totalGroupsCount = groups.length;
  const identityIdsInAllGroups: string[] = [];
  const identityIdsInSomeGroups: string[] = [];
  const identityIdsInNoGroups: string[] = [];
  for (const identity of identities) {
    let allocatedCount = 0;
    const identityGroupsLookup = new Set(identity.groups || []);

    for (const group of groups) {
      if (identityGroupsLookup.has(group.name)) {
        allocatedCount++;
      }
    }
    const groupAllocatedToAll = allocatedCount === totalGroupsCount;
    const groupAllocatedToSome = !groupAllocatedToAll && allocatedCount > 0;

    if (groupAllocatedToAll) {
      identityIdsInAllGroups.push(identity.id);
      continue;
    }

    if (groupAllocatedToSome) {
      identityIdsInSomeGroups.push(identity.id);
      continue;
    }

    identityIdsInNoGroups.push(identity.id);
  }

  return {
    identityIdsInAllGroups,
    identityIdsInSomeGroups,
    identityIdsInNoGroups,
  };
};

export const getAddedOrRemovedIdentities = (
  allIdentities: LxdIdentity[],
  addedIdentities: Set<string>,
  removedIdentities: Set<string>,
) => {
  const addedOrRemovedIdentities = allIdentities.filter(
    (identity) =>
      addedIdentities.has(identity.id) || removedIdentities.has(identity.id),
  );

  return addedOrRemovedIdentities;
};

// Given a set of identities that should be allocated to all groups and,
// Given a set of identities that should be removed from all groups
// Generate new groups to be assigned to each identity
export const generateGroupAllocationsForIdentities = (
  addedIdentities: Set<string>,
  removedIdentities: Set<string>,
  selectedGroups: LxdGroup[],
  addedOrRemovedIdentities: LxdIdentity[],
): Record<string, string[]> => {
  const addedIdentitiesLookup = new Set(addedIdentities);
  const removedIdentitiesLookup = new Set(removedIdentities);
  const selectedGroupsLookup = new Set(
    selectedGroups.map((group) => group.name),
  );

  const newGroupsForIdentities: Record<string, string[]> = {};
  for (const identity of addedOrRemovedIdentities) {
    const existingIdentityGroups = identity.groups || [];
    const newIdentityGroups = new Set(existingIdentityGroups);

    // see if any group should be removed from the identity
    for (const group of existingIdentityGroups) {
      if (
        removedIdentitiesLookup.has(identity.id) &&
        selectedGroupsLookup.has(group)
      ) {
        newIdentityGroups.delete(group);
      }
    }

    // add groups to identity if necessary
    for (const group of selectedGroups) {
      if (addedIdentitiesLookup.has(identity.id)) {
        newIdentityGroups.add(group.name);
      }
    }

    newGroupsForIdentities[identity.id] = Array.from(newIdentityGroups);
  }

  return newGroupsForIdentities;
};

export const getChangesInGroupsForIdentities = (
  allIdentities: LxdIdentity[],
  selectedGroups: LxdGroup[],
  addedIdentities: Set<string>,
  removedIdentities: Set<string>,
): ChangeSummary => {
  const addedOrRemovedIdentities = getAddedOrRemovedIdentities(
    allIdentities,
    addedIdentities,
    removedIdentities,
  );

  const newGroupsForIdentities = generateGroupAllocationsForIdentities(
    addedIdentities,
    removedIdentities,
    selectedGroups,
    addedOrRemovedIdentities,
  );

  const identityGroupsChangeSummary: ChangeSummary = {};

  for (const identity of addedOrRemovedIdentities) {
    const newIdentityGroups = newGroupsForIdentities[identity.id];
    if (!newIdentityGroups) {
      continue;
    }

    const groupsAddedForIdentity: Set<string> = new Set();
    const groupsRemovedForIdentity: Set<string> = new Set();

    // given a set of groups, for each identity check if each group is an addition
    const existingIdentityGroupsLookup = new Set(identity.groups);
    for (const newGroup of newIdentityGroups) {
      if (!existingIdentityGroupsLookup.has(newGroup)) {
        groupsAddedForIdentity.add(newGroup);
      }
    }

    // Also check the reverse, if a group previously existed for the identity and is not part of the new groups, then that's a removal
    const newIdentityGroupsLookup = new Set(newIdentityGroups);
    for (const existingGroup of identity.groups || []) {
      if (!newIdentityGroupsLookup.has(existingGroup)) {
        groupsRemovedForIdentity.add(existingGroup);
      }
    }

    // record the changes in groups for an identity, if there are changes
    if (groupsAddedForIdentity.size || groupsRemovedForIdentity.size) {
      identityGroupsChangeSummary[identity.id] = {
        added: groupsAddedForIdentity,
        removed: groupsRemovedForIdentity,
        name: identity.name,
      };
    }
  }

  return identityGroupsChangeSummary;
};
