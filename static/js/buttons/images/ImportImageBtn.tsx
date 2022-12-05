import React, { FC, useState } from "react";
import { importImage } from "../../api/images";
import { RemoteImage } from "../../types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import { Button } from "@canonical/react-components";

interface Props {
  image: RemoteImage;
  notify: NotificationHelper;
}

const ImportImageBtn: FC<Props> = ({ image, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleImport = () => {
    setLoading(true);
    notify.info("Import started, this can take several minutes.");
    importImage(image)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.images],
        });
        notify.success(
          `Image imported: ${image.os} ${image.arch} ${image.release} ${image.aliases}`
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on image import.", e);
      });
  };

  return (
    <Button dense onClick={handleImport} disabled={isLoading}>
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--import"
        }
      >
        Delete
      </i>
    </Button>
  );
};

export default ImportImageBtn;
