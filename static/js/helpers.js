const isoTimeToString = (isoTime) => {
  return new Date(isoTime).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

function handleResponse(response) {
  if (!response.ok) {
    throw Error(response.status);
  }
  return response.json();
}

export { handleResponse, isoTimeToString };
