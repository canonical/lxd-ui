import type { FC } from "react";
import { cloneElement, useState } from "react";
import { isWidthBelow } from "util/helpers";
import useEventListener from "util/useEventListener";
import MigrateVolumeBtn from "./MigrateVolumeBtn";
import ExportVolumeBtn from "./ExportVolumeBtn";
import DeleteStorageVolumeBtn from "./actions/DeleteStorageVolumeBtn";
import type { LxdStorageVolume } from "types/storage";
import CopyVolumeBtn from "./actions/CopyVolumeBtn";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import ResourceLabel from "components/ResourceLabel";
import {
  ContextualMenu,
  useToastNotification,
} from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  volume: LxdStorageVolume;
  project: string;
}

const StorageVolumeDetailActions: FC<Props> = ({ volume, project }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(isWidthBelow(1200));
  const { hasClusterInternalCustomVolumeCopy } = useSupportedFeatures();
  const navigate = useNavigate();
  const toastNotify = useToastNotification();

  useEventListener("resize", () => {
    setIsSmallScreen(isWidthBelow(1200));
  });

  const classname = isSmallScreen
    ? "p-contextual-menu__link"
    : "p-segmented-control__button";

  const menuElements = [
    <MigrateVolumeBtn
      key="migrate"
      volume={volume}
      project={project}
      classname={classname}
    />,
    ...(hasClusterInternalCustomVolumeCopy
      ? [<CopyVolumeBtn key="copy" volume={volume} classname={classname} />]
      : []),
    <ExportVolumeBtn key="export" volume={volume} classname={classname} />,
    <DeleteStorageVolumeBtn
      key="delete"
      label="Delete"
      volume={volume}
      project={project}
      appearance=""
      hasIcon
      onFinish={() => {
        navigate(`/ui/project/${encodeURIComponent(project)}/storage/volumes`);
        toastNotify.success(
          <>
            Storage volume{" "}
            <ResourceLabel bold type="volume" value={volume.name} /> deleted.
          </>,
        );
      }}
      classname={classname}
    />,
  ];

  return (
    <>
      {isSmallScreen ? (
        <ContextualMenu
          closeOnOutsideClick={false}
          toggleLabel="Actions"
          position="left"
          hasToggleIcon
          title="actions"
        >
          {(close: () => void) => (
            <span>
              {[...menuElements].map((item) =>
                cloneElement(item, { onClose: close }),
              )}
            </span>
          )}
        </ContextualMenu>
      ) : (
        <div className="p-segmented-control">
          <div className="p-segmented-control__list">{menuElements}</div>
        </div>
      )}
    </>
  );
};

export default StorageVolumeDetailActions;
