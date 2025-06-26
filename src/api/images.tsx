import { handleResponse } from "util/helpers";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdImage } from "types/image";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import type { EventQueue } from "context/eventQueue";
import type { LxdInstance } from "types/instance";
import type { UploadState } from "types/storage";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { withEntitlementsQuery } from "util/entitlements/api";

const imageEntitlements = ["can_delete"];

export const fetchImagesInProject = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdImage[]> => {
  const entitlements = withEntitlementsQuery(isFineGrained, imageEntitlements);
  return fetch(`/1.0/images?recursion=1&project=${project}${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdImage[]>) => {
      return data.metadata;
    });
};

export const fetchImagesInAllProjects = async (
  isFineGrained: boolean | null,
): Promise<LxdImage[]> => {
  const entitlements = withEntitlementsQuery(isFineGrained, imageEntitlements);
  return fetch(`/1.0/images?recursion=1&all-projects=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdImage[]>) => {
      return data.metadata;
    });
};

export const deleteImage = async (
  image: LxdImage,
  project: string,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/images/${image.fingerprint}?project=${project}`, {
    method: "DELETE",
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteImageBulk = async (
  fingerprints: string[],
  project: string,
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      fingerprints.map(async (name) => {
        const image = { fingerprint: name } as LxdImage;
        return deleteImage(image, project)
          .then((operation) => {
            eventQueue.set(
              operation.metadata.id,
              () => {
                pushSuccess(results);
              },
              (msg) => {
                pushFailure(results, msg);
              },
              () => {
                continueOrFinish(results, fingerprints.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, fingerprints.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

export const createImageAlias = async (
  fingerprint: string,
  alias: string,
  project: string,
): Promise<void> => {
  await fetch(`/1.0/images/aliases?project=${project}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: fingerprint,
      name: alias,
    }),
  }).then(handleResponse);
};

export const createImage = async (
  body: string,
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/images?project=${instance.project}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const uploadImage = async (
  body: File | FormData,
  isPublic: boolean,
  setUploadState: (value: UploadState) => void,
  project: string,
): Promise<LxdOperationResponse> => {
  return axios
    .post(`/1.0/images?project=${project}`, body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-LXD-public": JSON.stringify(isPublic),
      },
      onUploadProgress: (event) => {
        setUploadState({
          percentage: event.progress ? Math.floor(event.progress * 100) : 0,
          loaded: event.loaded,
          total: event.total,
        });
      },
    })
    .then((response: AxiosResponse<LxdOperationResponse>) => response.data);
};
