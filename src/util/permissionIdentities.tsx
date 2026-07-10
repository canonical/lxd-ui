import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { List } from "@canonical/react-components";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";
import type { ResourceIconType } from "components/ResourceIcon";
import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import DocLink from "components/DocLink";

export const IDENTITY_TYPE = {
  TLS: "tls-certificate",
  BEARER_CLIENT: "Client token bearer",
  BEARER_DEVLXD: "DevLXD token bearer",
} as const;

export type IdentityType = (typeof IDENTITY_TYPE)[keyof typeof IDENTITY_TYPE];

export type BearerIdentityType = Extract<
  IdentityType,
  typeof IDENTITY_TYPE.BEARER_CLIENT | typeof IDENTITY_TYPE.BEARER_DEVLXD
>;

export type ChangeSummary = Record<
  string,
  { added: Set<string>; removed: Set<string>; name: string }
>;

export const getIdentityIdsForGroup = (group?: LxdAuthGroup): string[] => {
  const bearerIdentityIds = group?.identities?.bearer || [];
  const oidcIdentityIds = group?.identities?.oidc || [];
  const tlsIdentityIds = group?.identities?.tls || [];
  return [...bearerIdentityIds, ...oidcIdentityIds, ...tlsIdentityIds];
};

// Given a set of lxd groups and some identities
// Generate a subset of those groups that's allocated to all identities
// Generate a subset of those groups that's allocated to some identities
export const getGroupsForIdentities = (
  groups: LxdAuthGroup[],
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

export const getIdentityIconType = (
  identityType: LxdIdentity["type"],
): ResourceIconType => {
  if (identityType.startsWith("Server certificate")) {
    return "cluster-member";
  }

  if (identityType.startsWith("Cluster link certificate")) {
    return "cluster-link";
  }

  if (identityType.startsWith("Metrics certificate")) {
    return "metric";
  }

  if (identityType.startsWith("OIDC client")) {
    return "oidc-identity";
  }

  if (identityType.toLowerCase().includes("token bearer")) {
    return "token-bearer";
  }

  return "certificate";
};

export const BEARER_EXPIRY_PATTERN = /^(\d+[ymwdHMS])(?:\s+\d+[ymwdHMS])*$/;

export const IDENTITY_TYPE_HELP_TEXT: Record<
  IdentityType,
  { title: string; description: ReactNode }
> = {
  [IDENTITY_TYPE.TLS]: {
    title: "TLS Certificate",
    description:
      "A certificate-based identity for long-lived client authentication to the LXD API.",
  },
  [IDENTITY_TYPE.BEARER_CLIENT]: {
    title: "Bearer token (Main API)",
    description:
      "An API key alternative to TLS certificates. Best for external automation tools, integrations, or remote scripts interacting with LXD over the network.",
  },
  [IDENTITY_TYPE.BEARER_DEVLXD]: {
    title: "Bearer token (DevLXD)",
    description: (
      <>
        Strictly for applications or storage drivers running directly inside a
        guest instance that need to communicate back to the host via the
        internal <code>/dev/lxd</code> socket.
      </>
    ),
  },
};

export const CREATE_IDENTITY_MODAL_TEXT: Record<
  IdentityType,
  {
    codeSnippetTitle: string;
    notificationTitle: string;
    notificationBody: string;
    howToUseCli?: (token: string) => ReactNode;
    howToUseUi?: ReactNode;
  }
> = {
  [IDENTITY_TYPE.TLS]: {
    codeSnippetTitle: "Your identity trust token",
    notificationTitle: "Copy the identity trust token",
    notificationBody: "to authenticate your client.",
    howToUseCli: (token: string) => (
      <>
        For use with the LXC command-line tool, run:
        <CodeSnippetWithCopyButton
          code={`lxc remote add ${location.hostname} ${token}`}
          tooltipMessage="Copy command"
          className="u-no-margin--bottom"
        />
        <span className="u-text--muted p-text--small u-sv3">
          You can replace <code>{location.hostname}</code> with a nickname for
          this server.
        </span>
      </>
    ),
    howToUseUi: (
      <List
        className="u-no-margin--bottom"
        items={[
          <>
            Open an unauthenticated browser on{" "}
            <Link to={location.origin}>{location.origin}</Link>.
          </>,
          <>
            Select <b>Setup TLS login</b> and follow the instructions to
            configure the browser certificate.
          </>,
          <>
            Use this identity trust token to add the new browser certificate to
            this server&apos;s trust store.
          </>,
        ]}
      />
    ),
  },
  [IDENTITY_TYPE.BEARER_CLIENT]: {
    codeSnippetTitle: "Your API bearer token",
    notificationTitle: "Copy the API bearer token",
    notificationBody: "to authenticate your clients and automated tools.",
    howToUseCli: (token: string) => (
      <List
        className="u-no-margin--bottom"
        items={[
          <>
            Set the bearer token in the <code>Authorization</code> header.
          </>,
          <>
            You can verify trust by checking the <code>auth</code> field in the
            response metadata of <code>GET /1.0</code>:
          </>,
          <CodeSnippetWithCopyButton
            code={`curl -k -H "Authorization: Bearer ${token}" ${location.origin}/1.0`}
            tooltipMessage="Copy command"
            className="u-no-margin--bottom"
            key="code-snippet"
          />,
          <DocLink
            docPath="/howto/auth_bearer/"
            key="learn-more-link"
            hasExternalIcon
          >
            How to authenticate to the LXD API using bearer tokens
          </DocLink>,
        ]}
      />
    ),
  },
  [IDENTITY_TYPE.BEARER_DEVLXD]: {
    codeSnippetTitle: "Your DevLXD bearer token",
    notificationTitle: "Copy the DevLXD bearer token",
    notificationBody: "to authenticate internal workloads.",
    howToUseCli: (token: string) => (
      <List
        className="u-no-margin--bottom"
        items={[
          <>
            The token can be used to authenticate with LXD over the DevLXD
            socket at <code>/dev/lxd/sock</code>.{" "}
          </>,
          <>
            It must be set as a bearer token in the <code>Authorization</code>{" "}
            header.
          </>,
          <>
            You can verify trust by checking the <code>auth</code> field in the
            response of <code>GET /1.0</code>:
          </>,
          <CodeSnippetWithCopyButton
            code={`curl -H "Authorization: Bearer ${token}" -s --unix-socket /dev/lxd/sock http://custom.socket/1.0`}
            tooltipMessage="Copy command"
            className="u-no-margin--bottom"
            key="code-snippet"
          />,
          <span
            className="u-text--muted p-text--small u-sv3"
            key="code-snippet-help-text"
          >
            Run this command inside your instance.
          </span>,
          <DocLink
            docPath="/howto/devlxd_authenticate/"
            key="learn-more-link"
            hasExternalIcon
          >
            How to authenticate to the DevLXD API
          </DocLink>,
        ]}
      />
    ),
  },
};
