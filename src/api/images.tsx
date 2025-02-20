import {
  continueOrFinish,
  handleResponse,
  pushFailure,
  pushSuccess,
} from "util/helpers";
import type { LxdImage } from "types/image";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { EventQueue } from "context/eventQueue";
import type { LxdInstance } from "types/instance";
import type { UploadState } from "types/storage";
import axios, { AxiosResponse } from "axios";
import { withEntitlementsQuery } from "util/entitlements/api";

const imageEntitlements = ["can_delete"];

export const fetchImagesInProject = (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdImage[]> => {
  const entitlements = withEntitlementsQuery(isFineGrained, imageEntitlements);
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images?recursion=1&project=${project}${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdImage[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchImagesInAllProjects = (
  isFineGrained: boolean | null,
): Promise<LxdImage[]> => {
  const entitlements = withEntitlementsQuery(isFineGrained, imageEntitlements);
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images?recursion=1&all-projects=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdImage[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const deleteImage = (
  image: LxdImage,
  project: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/${image.fingerprint}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteImageBulk = (
  fingerprints: string[],
  project: string,
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      fingerprints.map((name) => {
        const image = { fingerprint: name } as LxdImage;
        return deleteImage(image, project)
          .then((operation) => {
            eventQueue.set(
              operation.metadata.id,
              () => pushSuccess(results),
              (msg) => pushFailure(results, msg),
              () => continueOrFinish(results, fingerprints.length, resolve),
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

export const createImageAlias = (
  fingerprint: string,
  alias: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/aliases?project=${project}`, {
      method: "POST",
      body: JSON.stringify({
        target: fingerprint,
        name: alias,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const createImage = (
  body: string,
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images?project=${instance.project}`, {
      method: "POST",
      body: body,
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const uploadImage = (
  body: File | FormData,
  isPublic: boolean,
  setUploadState: (value: UploadState) => void,
  project: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/1.0/images?project=${project}`, body, {
        headers: {
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
      .then((response: AxiosResponse<LxdOperationResponse>) => response.data)
      .then(resolve)
      .catch(reject);
  });
};
