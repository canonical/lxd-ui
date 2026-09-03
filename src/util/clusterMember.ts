import type { LxdClusterMember, LxdClusterMemberStatus } from "types/cluster";

export const isClusterMemberRoleAutomatic = (role: string) => {
  return role.startsWith("database");
};

export const classifyClusterMemberRoles = (roles?: string[]) => {
  if (!roles || roles.length === 0) {
    return {
      automaticRoles: [],
      customRoles: [],
    };
  }

  const automaticRoles = roles.filter((role) =>
    isClusterMemberRoleAutomatic(role),
  );
  const customRoles = roles.filter(
    (role) => !isClusterMemberRoleAutomatic(role),
  );

  return {
    automaticRoles,
    customRoles,
  };
};

export const getClusterMemberRolesList = (roles?: string[]) => {
  const { automaticRoles: automatic, customRoles: custom } =
    classifyClusterMemberRoles(roles);

  return {
    automaticRoles: automatic.length > 0 ? automatic.join(", ") : "-",
    customRoles: custom.length > 0 ? custom.join(", ") : "-",
  };
};

export const getClusterLeader = (
  members: LxdClusterMember[],
): LxdClusterMember | undefined => {
  return members.find((member) => member.roles?.includes("database-leader"));
};

export const getClusterMemberStatusCounts = (
  members: LxdClusterMember[],
): Record<LxdClusterMemberStatus, number> => {
  const counts: Record<LxdClusterMemberStatus, number> = {
    Online: 0,
    Evacuated: 0,
    Offline: 0,
    Blocked: 0,
  };

  members.forEach((member) => {
    counts[member.status] += 1;
  });

  return counts;
};

export const getClusterMemberStatusIconName = (
  status: LxdClusterMemberStatus,
) => {
  return (
    {
      Evacuated: "status-queued-small",
      Online: "status-succeeded-small",
      Offline: "status-failed-small",
      Blocked: "status-waiting-small",
    }[status] ?? ""
  );
};
