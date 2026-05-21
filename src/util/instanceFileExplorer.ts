import type { LxdFileExplorerItem } from "types/fileExplorer";
import { handleResponse } from "./helpers";
import { ROOT_PATH } from "./rootPath";

export const fetchInstanceFile = async (
  name: string,
  project: string,
  path: string,
): Promise<LxdFileExplorerItem> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("path", path);

  return fetch(
    `${ROOT_PATH}/1.0/instances/${encodeURIComponent(name)}/files?${params.toString()}`,
    {
      method: "GET",
    },
  )
    .then(handleResponse)
    .then((data: LxdFileExplorerItem) => {
      return data;
    });
};

export const fetchInstanceFileHeader = async (
  name: string,
  project: string,
  path: string,
): Promise<Response> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("path", path);

  return fetch(
    `${ROOT_PATH}/1.0/instances/${encodeURIComponent(name)}/files?${params.toString()}`,
    {
      method: "HEAD",
    },
  ).then((response: Response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch instance file header: ${response.status} ${response.statusText}`,
      );
    }
    return response;
  });
};
