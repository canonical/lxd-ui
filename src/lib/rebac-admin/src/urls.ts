import cloneDeep from "clone-deep";

import { argPath } from "utils";

const urls = {
  accessGovernance: {
    index: "/access-governance",
    reports: "/access-governance/reports",
    log: "/access-governance/log",
  },
  authentication: {
    index: "/authentication",
    add: "/authentication/add",
    local: "/authentication/local",
  },
  entitlements: "/entitlements",
  groups: {
    index: "/groups",
    add: "/groups/add",
    edit: argPath<{ id: string }>("/groups/:id/edit"),
    delete: argPath<{ id: string }>("/groups/:id/delete"),
  },
  index: "/",
  resources: {
    index: "/resources",
    list: "/resources/list",
  },
  roles: {
    index: "/roles",
    add: "/roles/add",
    edit: argPath<{ id: string }>("/roles/:id/edit"),
    delete: argPath<{ id: string }>("/roles/:id/delete"),
  },
  users: {
    index: "/users",
    add: "/users/add",
    edit: argPath<{ id: string }>("/users/:id/edit"),
    delete: argPath<{ id: string }>("/users/:id/delete"),
  },
};

const prefixSection = <S extends object>(prefix: string, section: S): S => {
  const clonedSection = cloneDeep(section);
  for (const key in clonedSection) {
    const entry = clonedSection[key];
    if (entry && typeof entry === "object") {
      // Run the prefixer over the nested object.
      clonedSection[key] = prefixSection(prefix, entry);
    } else if (typeof entry === "function") {
      // Wrap the function in another that will prefix the result.
      clonedSection[key] = ((...args: unknown[]) => {
        const result = entry(...args);
        if (typeof result === "string") {
          return `${prefix}${result}`;
        }
        return result;
      }) as typeof entry;
    } else if (typeof entry === "string") {
      // Prefix strings.
      clonedSection[key] = `${prefix}${entry}` as typeof entry;
    }
  }
  return clonedSection;
};

export const prefixedURLs = (baseURL: string) => {
  let prefix = baseURL.startsWith("/") ? baseURL : `/${baseURL}`;
  prefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  return prefixSection(prefix, urls);
};

export default urls;
