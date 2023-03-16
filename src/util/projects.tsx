export const projectSubpages = [
  "instances",
  "profiles",
  "networks",
  "storages",
  "configuration",
];

export const getProjectFromUrl = (url: string) => {
  const parts = url.split("/");
  if (projectSubpages.includes(parts[3])) {
    return parts[2];
  }
  return undefined;
};

export const getSubpageFromUrl = (url: string) => {
  const parts = url.split("/");
  if (projectSubpages.includes(parts[3])) {
    return parts[3];
  }
  return undefined;
};
