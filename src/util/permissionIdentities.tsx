import type { LxdGroup, LxdIdentity } from "types/permissions";

export type ChangeSummary = Record<
  string,
  { added: Set<string>; removed: Set<string>; name: string }
>;

export const getIdentityIdsForGroup = (group?: LxdGroup): string[] => {
  const oidcIdentityIds = group?.identities?.oidc || [];
  const tlsIdentityIds = group?.identities?.tls || [];
  return [...oidcIdentityIds, ...tlsIdentityIds];
};

// Given a set of lxd groups and some identities
// Generate a subset of those groups that's allocated to all identities
// Generate a subset of those groups that's allocated to some identities
export const getGroupsForIdentities = (
  groups: LxdGroup[],
  identities: LxdIdentity[],
): {
  groupsForAllIdentities: string[];
  groupsForSomeIdentities: string[];
  groupsForNoIdentities: string[];
} => {
  const totalIdentitiesCount = identities.length;
  const groupsForAllIdentities: string[] = [];
  const groupsForSomeIdentities: string[] = [];
  const groupsForNoIdentities: string[] = [];
  for (const group of groups) {
    let allocatedCount = 0;
    const allIdentityIds = getIdentityIdsForGroup(group);
    const groupIdentitiesLookup = new Set(allIdentityIds);

    for (const identity of identities) {
      if (groupIdentitiesLookup.has(identity.id)) {
        allocatedCount++;
      }
    }
    const groupAllocatedToAll = allocatedCount === totalIdentitiesCount;
    const groupAllocatedToSome = !groupAllocatedToAll && allocatedCount > 0;

    if (groupAllocatedToAll) {
      groupsForAllIdentities.push(group.name);
      continue;
    }

    if (groupAllocatedToSome) {
      groupsForSomeIdentities.push(group.name);
      continue;
    }

    groupsForNoIdentities.push(group.name);
  }

  return {
    groupsForAllIdentities,
    groupsForSomeIdentities,
    groupsForNoIdentities,
  };
};

// Given a set of groups that's added to all identities and,
// Given a set of groups that's removed from all identities
// Generate groups to be assigned to each identity
export const generateGroupAllocationsForIdentities = (
  addedGroups: Set<string>,
  removedGroups: Set<string>,
  identities: LxdIdentity[],
): Record<string, string[]> => {
  const newGroupsForIdentities: Record<string, string[]> = {};
  for (const identity of identities) {
    const newGroupsForIdentity = new Set(identity.groups);

    for (const group of addedGroups) {
      newGroupsForIdentity.add(group);
    }

    for (const group of removedGroups) {
      newGroupsForIdentity.delete(group);
    }

    newGroupsForIdentities[identity.id] = Array.from(newGroupsForIdentity);
  }

  return newGroupsForIdentities;
};

export const getChangesInGroupsForIdentities = (
  identities: LxdIdentity[],
  addedGroups: Set<string>,
  removedGroups: Set<string>,
): ChangeSummary => {
  const newGroupsForIdentities = generateGroupAllocationsForIdentities(
    addedGroups,
    removedGroups,
    identities,
  );

  const identityGroupsChangeSummary: ChangeSummary = {};

  for (const identity of identities) {
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
        name: getIdentityName(identity),
      };
    }
  }

  return identityGroupsChangeSummary;
};

export const pivotIdentityGroupsChangeSummary = (
  identityGroupsChangeSummary: ChangeSummary,
): ChangeSummary => {
  const identityIds = Object.keys(identityGroupsChangeSummary);
  const groupIdentitiesChangeSummary: ChangeSummary = {};

  for (const id of identityIds) {
    const identityGroupsChange = identityGroupsChangeSummary[id];
    // group added to an identity also means the identity is added to the group
    for (const group of identityGroupsChange.added) {
      if (!groupIdentitiesChangeSummary[group]) {
        groupIdentitiesChangeSummary[group] = {
          added: new Set(),
          removed: new Set(),
          name: group,
        };
      }

      groupIdentitiesChangeSummary[group].added.add(id);
    }

    // same logic as above but for removed groups
    for (const group of identityGroupsChange.removed) {
      if (!groupIdentitiesChangeSummary[group]) {
        groupIdentitiesChangeSummary[group] = {
          added: new Set(),
          removed: new Set(),
          name: group,
        };
      }

      groupIdentitiesChangeSummary[group].removed.add(id);
    }
  }

  return groupIdentitiesChangeSummary;
};

export const getIdentityName = (identity?: LxdIdentity): string => {
  if (!identity) {
    return "";
  }
  return identity.name.length > 0 ? identity.name : identity.id;
};
