import {
  continueOrFinish,
  handleResponse,
  pushFailure,
  pushSuccess,
} from "util/helpers";
import { ImportImage, LxdImage } from "types/image";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";
import { EventQueue } from "context/eventQueue";

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

export const fetchImageList = (project: string): Promise<LxdImage[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images?recursion=1&project=${project}`)
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

export const importImage = (
  remoteImage: ImportImage,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images", {
      method: "POST",
      body: JSON.stringify({
        auto_update: true,
        source: {
          alias: remoteImage.aliases.split(",")[0],
          mode: "pull",
          protocol: "simplestreams",
          type: "image",
          server: remoteImage.server,
        },
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
