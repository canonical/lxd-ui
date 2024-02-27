export interface LxdUsedBy {
  name: string;
  project: string;
  instance?: string;
  volume?: string;
  pool?: string;
}

/**
 * filter a usedBy path list by a specific type and parse into a LxdUsedBy object list
 *
 * examples for usedByPaths
 * "/1.0/instances/pet-lark"
 * "/1.0/instances/relaxed-basilisk/snapshots/ff?project=foo"
 * "/1.0/profiles/default?project=foo"
 * "/1.0/storage-pools/pool-dir/volumes/custom/test/snapshots/snap1?project=bar"
 */
export const filterUsedByType = (
  type: "instances" | "profiles" | "snapshots" | "images" | "volumes",
  usedByPaths?: string[],
): LxdUsedBy[] => {
  return (
    usedByPaths
      ?.filter((path) => {
        if (type === "instances" && path.includes("/snapshots/")) {
          return false;
        }

        if (type === "volumes" && path.includes("/snapshots/")) {
          return false;
        }

        if (type === "snapshots") {
          return path.includes("/snapshots/");
        }

        if (type === "volumes") {
          return path.includes("/volumes/");
        }

        return path.startsWith(`/1.0/${type}`);
      })
      .map((path) => {
        const url = new URL(`http://localhost/${path}`);
        const encodedName = url.pathname.split("/").slice(-1)[0] ?? "";
        // calling decode twice because the result is double encoded
        // see https://github.com/canonical/lxd/issues/12398
        const name = decodeURIComponent(decodeURIComponent(encodedName));
        return {
          name,
          project: url.searchParams.get("project") ?? "default",
          instance:
            type === "snapshots" && url.pathname.includes("1.0/instances")
              ? url.pathname.split("/")[4]
              : undefined,
          volume:
            type === "snapshots" && url.pathname.includes("1.0/storage-pools")
              ? url.pathname.split("/")[7]
              : undefined,
          pool:
            type === "snapshots" && url.pathname.includes("1.0/storage-pools")
              ? url.pathname.split("/")[4]
              : undefined,
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
  usedByPaths?: string[],
): LxdUsedBy[] => {
  return filterUsedByType("instances", usedByPaths).filter((instance) => {
    if (isDefaultProject) {
      return true;
    }
    return project === instance.project;
  });
};
