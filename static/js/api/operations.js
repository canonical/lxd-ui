export const watchOperation = (operationUrl) => {
  return new Promise((resolve, reject) => {
    fetch(operationUrl + "/wait?timeout=10")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        switch (data.metadata.status) {
          case "Running":
            reject(data);
            break;
          case "Success":
            resolve(data);
            break;
          default:
            reject(data);
        }
      });
  });
};
