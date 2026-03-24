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
