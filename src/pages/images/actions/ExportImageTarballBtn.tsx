import { FC, useState } from "react";
import { exportImage } from "api/images";
import { LxdImage } from "types/image";
import { ActionButton, Icon } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import {
  sanitizeExportFileName,
  splitHeaderAndBody,
  splitMultipartChunk,
} from "util/imageExport";

interface Props {
  image: LxdImage;
}

const ExportImageTarballBtn: FC<Props> = ({ image }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const description = image.properties?.description ?? image.fingerprint;

  const handleSingleFileExport = async (resp: Response) => {
    try {
      // backend may return a filename in the Content-Disposition header
      // e.g. content-disposition: attachment; filename=111.txt
      const contentDisposition = resp.headers.get("Content-Disposition");
      let filename = "image.tar.gz";
      if (contentDisposition && contentDisposition.includes("filename")) {
        filename = contentDisposition.split("filename=")[1];
      }

      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
      });

      const writeStream = await fileHandle.createWritable();
      const reader = resp.body?.getReader();

      if (!reader) {
        throw Error("Failed to start download");
      }

      let { done, value } = await reader.read();
      while (!done) {
        if (value) {
          await writeStream.write(value);
        }

        ({ done, value } = await reader.read());
      }

      await writeStream.close();
    } catch (e) {
      throw Error(e as string);
    }
  };

  const handleMultiFileExport = async (resp: Response) => {
    const contentType = resp.headers.get("Content-Type");
    const boundary = `--${contentType?.split("boundary=")[1]}`;

    const responseReader = resp.body?.getReader();
    if (!responseReader) {
      throw Error("Failed to start download");
    }

    const directoryHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    let partFilename = "";
    let writableStream: FileSystemWritableFileStream | null = null;
    let hasData = true;
    let fileSize = 0;
    while (hasData) {
      const { done, value } = await responseReader.read();
      if (done) {
        hasData = false;
      }

      if (!value) {
        continue;
      }

      const parts = splitMultipartChunk(value, boundary);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part.length) {
          if (writableStream) {
            await writableStream.close();
            writableStream = null;
          }
          continue;
        }

        const { headers, headerEndIndex, body } = splitHeaderAndBody(part);
        if (headerEndIndex !== -1) {
          const disposition = headers["content-disposition"];
          if (disposition) {
            partFilename = sanitizeExportFileName(
              disposition.split("filename=")[1],
            );

            // Open a writable stream for the part file
            const fileHandle = await directoryHandle.getFileHandle(
              partFilename,
              { create: true },
            );

            writableStream = await fileHandle.createWritable({
              keepExistingData: true,
            });
          }

          // Write the initial body data (if any)
          if (body && writableStream) {
            fileSize += body.length;
            await writableStream.write(body);

            if (i !== parts.length - 1) {
              // There is a carriage return at the end of the body, before the next boundary, we should exclude this from the body
              await writableStream.truncate(fileSize - 2);
              // Close the stream if there are more parts to come in the chunk
              // this means the next part should be written to a new file
              await writableStream.close();
              fileSize = 0;
            }
          }
        } else {
          // If the part is a continuation of the previous part
          // write it to the same file
          if (writableStream) {
            await writableStream.write(body);
            fileSize += body.length;
          }
        }
      }
    }

    if (writableStream) {
      await writableStream.truncate(fileSize - 2);
      await writableStream.close();
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportImage(image.fingerprint, async (resp: Response) => {
        const contentType = resp.headers.get("Content-Type");

        if (contentType?.includes("application/octet-stream")) {
          await handleSingleFileExport(resp);
          return;
        }

        if (contentType?.includes("multipart/form-data")) {
          await handleMultiFileExport(resp);
          return;
        }
      });

      toastNotify.success(
        `Image ${description} was successfully downloaded. Please check your downloads folder`,
      );
    } catch (e) {
      toastNotify.failure(
        `Image ${description} was unable to download. Check console for details.`,
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionButton
      loading={isLoading}
      onClick={() => void handleExport()}
      className="has-icon"
      appearance="base"
      disabled={isLoading}
    >
      <Icon name="export" />
    </ActionButton>
  );
};

export default ExportImageTarballBtn;
