import { handleResponse } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";
import type { LxdPlacementGroup } from "types/placementGroup";

const placementGroupEntitlements = ["can_delete", "can_edit"];

export const fetchPlacementGroups = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdPlacementGroup[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  params.set("project", project);
  addEntitlements(params, isFineGrained, placementGroupEntitlements);

  return fetch(`/1.0/placement-groups?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdPlacementGroup[]>) => {
      return data.metadata;
    });
};

export const fetchPlacementGroup = async (
  group: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdPlacementGroup> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addEntitlements(params, isFineGrained, placementGroupEntitlements);

  return fetch(
    `/1.0/placement-groups/${encodeURIComponent(group)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdPlacementGroup>) => {
      return data.metadata;
    });
};

export const createPlacementGroup = async (
  body: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(`/1.0/placement-groups?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const updatePlacementGroup = async (
  group: LxdPlacementGroup,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/placement-groups/${encodeURIComponent(group.name)}?${params.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify(group),
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then(handleResponse);
};

export const deletePlacementGroup = async (
  name: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/placement-groups/${encodeURIComponent(name)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};
