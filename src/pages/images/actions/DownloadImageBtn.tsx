import type { FC } from "react";
import { useState } from "react";
import type { LxdImage } from "types/image";
import {
  ActionButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  image: LxdImage;
  project: string;
}

const DownloadImageBtn: FC<Props> = ({ image, project }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const description = image.properties?.description ?? image.fingerprint;
  const isUnifiedTarball = image.update_source == null; //Only Split Tarballs have an update_source.
  const url = `${ROOT_PATH}/1.0/images/${encodeURIComponent(image.fingerprint)}/export?project=${encodeURIComponent(project)}`;

  const handleExport = () => {
    setLoading(true);
    const imageLink = (
      <ResourceLink
        to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/images`}
        type="image"
        value={description}
      />
    );

    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "download";
      a.click();
      window.URL.revokeObjectURL(url);

      toastNotify.success(
        <>
          Image {imageLink} download started. Please check your downloads
          folder.
        </>,
      );
    } catch (e) {
      toastNotify.failure(
        `Image ${description} was unable to download.`,
        e,
        imageLink,
      );
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
      disabled={!isUnifiedTarball || isLoading}
    >
      <Icon name="export" />
    </ActionButton>
  );
};

export default DownloadImageBtn;
