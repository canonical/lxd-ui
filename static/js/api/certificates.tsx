export const checkAuth = () =>
  fetch("/1.0/certificates").then((response) => response.status !== 403);
