export interface UploadExternalFormatFileFormValues {
  imageFile: File | null;
  name: string;
  pool: string;
  formatConversion: boolean;
  virtioConversion: boolean;
  architecture: string;
}

export const supportedVMArchOptions = (hostArchitectures: string[]) => {
  const vmArchitectureOptions = [
    { value: "x86_64", label: "x86_64" },
    { value: "aarch64", label: "aarch64" },
    { value: "ppc64le", label: "ppc64le" },
    { value: "s390x", label: "s390x" },
  ];

  return vmArchitectureOptions.filter((arch) =>
    hostArchitectures.includes(arch.value),
  );
};

export const uploadExternalFormatFilePayload = (
  values: UploadExternalFormatFileFormValues,
) => {
  const fileSize = values.imageFile?.size || 0;
  const conversionOptions = [];

  if (values.formatConversion) {
    conversionOptions.push("format");
  }

  if (values.virtioConversion) {
    conversionOptions.push("virtio");
  }

  const instanceArgs = {
    source: {
      type: "conversion",
      mode: "push",
      conversion_options: conversionOptions,
    },
    devices: {
      root: {
        path: "/",
        type: "disk",
        pool: values.pool,
      },
    },
    type: "virtual-machine",
    name: values.name,
    sourceDiskSize: fileSize,
    architecture: values.architecture,
  };

  return JSON.stringify(instanceArgs);
};

// This method facilitates the uploading of a file to a server via a websocket connection.
// 1. When the websocket connection opens, a FileReader instance is created to read the file in chunks.
// 2. The readNextFileChunk function slices the file into chunks of the specified chunk size and converts them into binary buffers.
// 3. If the chunk size is zero, indicating the end of the file, the websocket connection is closed.
// 4. The FileReader.onload event handler processes indiviual file chunks as they get read, which sends them
// through the websocket connection.
export const sendFileByWebSocket = (
  socketURL: string,
  file: File | null,
  onProgress?: (current: number, total: number) => void,
  onError?: (error: Error) => void,
) => {
  const chunkSize = 1024 * 1024; // 1MB
  const ws = new WebSocket(socketURL);

  ws.onopen = () => {
    const reader = new FileReader();
    let sentFileSize = 0;

    const readNextFileChunk = () => {
      if (!file) {
        return;
      }
      const chunk = file.slice(sentFileSize, sentFileSize + chunkSize);
      if (!chunk.size) {
        // NOTE: if we close the connection without a code, the default 1005 is used which will cause backend to throw an error
        ws.close(1000, "File upload complete");
        return;
      }

      reader.readAsArrayBuffer(chunk);
    };

    reader.onload = (event) => {
      if (!file) {
        return;
      }

      const result = event.target?.result;
      let data: ArrayBuffer | ArrayBufferLike;
      if (result && typeof result === "string") {
        // Convert string to ArrayBuffer
        data = new TextEncoder().encode(result).buffer;
      } else {
        data = result as ArrayBuffer;
      }

      ws.send(data);

      sentFileSize += data.byteLength;
      if (onProgress) {
        onProgress(sentFileSize, file.size);
      }

      readNextFileChunk();
    };

    reader.onerror = (e) => {
      if (onError) {
        onError(
          e.target?.error
            ? e.target.error
            : new Error("Failed to read read file"),
        );
      }
    };

    readNextFileChunk();
  };
};

export const isImageTypeRaw = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      const bytes = new Uint8Array(arrayBuffer as ArrayBuffer);

      // Checking for the DOS/MBR boot sector signature (0x55AA at the end of the first sector)
      // NOTE: this is not a foolproof method to determine if a file is a raw image
      // not all raw VM images will contain a boot sector with this signature
      if (bytes[510] === 0x55 && bytes[511] === 0xaa) {
        resolve(true);
      } else {
        // Further checks can be added here for other raw formats
        resolve(false);
      }
    };

    reader.onerror = () => {
      resolve(false);
    };

    // Read the first 512 bytes (typically the size of a boot sector for a raw vm image)
    reader.readAsArrayBuffer(file.slice(0, 512));
  });
};
