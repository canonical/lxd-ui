import { handleResponse } from "util/helpers";

export const checkAuth = () =>
  fetch("/1.0/certificates").then((response) => response.status !== 403);

export const addCertificate = (token: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/certificates`, {
      method: "POST",
      body: JSON.stringify({
        type: "client",
        password: token,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
