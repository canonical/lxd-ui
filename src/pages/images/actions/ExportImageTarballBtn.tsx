import { FC, useState } from "react";
import { getExportedImage } from "api/images";
import { LxdImage } from "types/image";
import { ActionButton, Icon } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  image: LxdImage;
}

const ExportImageTarballBtn: FC<Props> = ({ image }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const description = image.properties?.description ?? image.fingerprint;

  const handleExport = async () => {
    setLoading(true);
    try {
      await getExportedImage(image.fingerprint);
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
