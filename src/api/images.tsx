import {
  continueOrFinish,
  handleResponse,
  pushFailure,
  pushSuccess,
} from "util/helpers";
import { LxdImage } from "types/image";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";
import { EventQueue } from "context/eventQueue";
import { LxdInstance } from "types/instance";
import { UploadState } from "types/storage";
import axios, { AxiosResponse } from "axios";

export const fetchImage = (
  image: string,
  project: string,
): Promise<LxdImage> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/${image}?project=${project}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdImage>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchImageList = (project?: string): Promise<LxdImage[]> => {
  const url =
    "/1.0/images?recursion=1" + (project ? `&project=${project}` : "");
  return new Promise((resolve, reject) => {
    fetch(url)
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
  return new Promise((resolve) => {
    void Promise.allSettled(
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
    );
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
