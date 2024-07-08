import { handleResponse } from "util/helpers";
import { LxdApiResponse } from "types/apiResponse";
import { LxdCertificate } from "types/certificate";

export const fetchCertificates = (): Promise<LxdCertificate[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/certificates?recursion=1")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdCertificate[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const addCertificate = (
  token: string,
  hasExplicitTrustToken: boolean,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tokenFieldName = hasExplicitTrustToken ? "trust_token" : "password";
    fetch(`/1.0/certificates`, {
      method: "POST",
      body: JSON.stringify({
        type: "client",
        [tokenFieldName]: token,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
