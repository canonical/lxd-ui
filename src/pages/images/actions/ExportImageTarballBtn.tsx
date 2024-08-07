import { FC, useState } from "react";
import { exportImage } from "api/images";
import { LxdImage } from "types/image";
import { ActionButton, Icon } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import { sanitizeFileName } from "util/helpers";

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

    const reader = resp.body?.getReader();
    if (!reader) {
      throw Error("Failed to start download");
    }

    const directoryHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    const decoder = new TextDecoder("utf-8");
    const encoder = new TextEncoder();

    let partFilename = "";
    let writableStream: FileSystemWritableFileStream | null = null;
    let hasData = true;
    while (hasData) {
      const { done, value } = await reader.read();
      if (done) hasData = false;

      const chunkStr = decoder.decode(value, { stream: true });
      const parts = chunkStr.split(boundary).map((part) => part.trim());

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) {
          if (writableStream) await writableStream.close();
          continue;
        }

        const partDataSplit = part.split("\r\n\r\n");
        const hasHeaders = partDataSplit.length === 2;
        if (hasHeaders) {
          // Parse headers
          const [header, body] = partDataSplit;
          const headerLines = header.split("\r\n");
          const disposition = headerLines.find((line) =>
            line.startsWith("Content-Disposition"),
          );

          if (disposition) {
            partFilename = sanitizeFileName(
              disposition.split("filename=")[1].replace(/['"]+/g, ""),
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
            await writableStream.write(new Blob([encoder.encode(body)]));

            // Close the stream if there are more parts to come in the chunk
            if (i !== parts.length - 1) {
              await writableStream.close();
            }
          }
        } else {
          if (writableStream) {
            // Write the next chunk of data to the file
            await writableStream.write(new Blob([encoder.encode(part)]));
          }
        }
      }
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
