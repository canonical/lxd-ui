import { handleResponse } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdCertificate } from "types/certificate";

export const fetchCertificates = async (): Promise<LxdCertificate[]> => {
  return fetch("/1.0/certificates?recursion=1")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdCertificate[]>) => {
      return data.metadata;
    });
};

export const addCertificate = async (token: string): Promise<void> => {
  await fetch(`/1.0/auth/identities/tls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      trust_token: token,
    }),
  }).then(handleResponse);
};
