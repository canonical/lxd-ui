import { FC, useState } from "react";
import { LxdImage } from "types/image";
import { ActionButton, Icon } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  image: LxdImage;
  project: string;
}

const DownloadImageBtn: FC<Props> = ({ image, project }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const description = image.properties?.description ?? image.fingerprint;
  const isUnifiedTarball = image.update_source == null; //Only Split Tarballs have an update_source.
  const url = `/1.0/images/${image.fingerprint}/export?project=${project}`;

  const handleExport = () => {
    setLoading(true);

    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "download";
      a.click();
      window.URL.revokeObjectURL(url);

      toastNotify.success(
        `Image ${description} download started. Please check your downloads folder.`,
      );
    } catch (e) {
      toastNotify.failure(`Image ${description} was unable to download.`, e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionButton
      title={
        isUnifiedTarball ? "Export image" : "Cannot export this image format."
      }
      aria-label="export image"
      loading={isLoading}
      onClick={handleExport}
      className="has-icon"
      appearance="base"
      disabled={!isUnifiedTarball}
    >
      <Icon name="export" />
    </ActionButton>
  );
};

export default DownloadImageBtn;
