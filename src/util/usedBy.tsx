export interface LxdUsedBy {
  name: string;
  project: string;
  instance: string;
}

/**
 * filter a usedBy path list by a specific type and parse into a LxdUsedBy object list
 *
 * examples for usedByPaths
 * "/1.0/instances/pet-lark"
 * "/1.0/instances/relaxed-basilisk/snapshots/ff?project=foo"
 * "/1.0/profiles/default?project=foo"
 */
export const filterUsedByType = (
  type: "instances" | "profiles" | "snapshots" | "images" | "storage-pools",
  defaultProject: string,
  usedByPaths?: string[]
): LxdUsedBy[] => {
  return (
    usedByPaths
      ?.filter((path) => {
        if (type === "instances" && path.includes("/snapshots/")) {
          return false;
        }

        if (type === "snapshots") {
          return path.includes("/snapshots/");
        }

        return path.startsWith(`/1.0/${type}`);
      })
      .map((path) => {
        const url = new URL(`http://localhost/${path}`);
        return {
          name: url.pathname.split("/").slice(-1)[0] ?? "",
          project: url.searchParams.get("project") ?? defaultProject,
          instance: type === "snapshots" ? url.pathname.split("/")[4] : "",
        };
      })
      .sort((a, b) => {
        return a.project < b.project
          ? -1
          : a.project > b.project
          ? 1
          : a.name < b.name
          ? -1
          : a.name > b.name
          ? 1
          : 0;
      }) ?? []
  );
};

export const getProfileInstances = (
  project: string,
  isDefaultProject: boolean,
  usedByPaths?: string[]
): LxdUsedBy[] => {
  return filterUsedByType("instances", "default", usedByPaths).filter(
    (instance) => {
      if (isDefaultProject) {
        return true;
      }
      return project === instance.project;
    }
  );
};
