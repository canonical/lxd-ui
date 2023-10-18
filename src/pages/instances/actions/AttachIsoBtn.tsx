import React, { FC, useState } from "react";
import { updateInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import { useParams } from "react-router-dom";
import { ActionButton, useNotify } from "@canonical/react-components";
import { getInstanceEditValues, getInstancePayload } from "util/instanceEdit";
import { LxdIsoDevice } from "types/device";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePortal from "react-useportal";
import { RemoteImage } from "types/image";
import CustomIsoModal from "pages/images/CustomIsoModal";
import { remoteImageToIsoDevice } from "util/formDevices";
import { useEventQueue } from "context/eventQueue";

interface Props {
  instance: LxdInstance;
}

const AttachIsoBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const { project } = useParams<{ project: string }>();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [isLoading, setLoading] = useState(false);

  const attachedIso = instance.devices["iso-volume"] as
    | LxdIsoDevice
    | undefined;

  const detachIso = () => {
    setLoading(true);
    const values = getInstanceEditValues(instance);
    values.devices = values.devices.filter((device) => {
      return device.name !== "iso-volume";
    });
    const instanceMinusIso = getInstancePayload(
      instance,
      values,
    ) as LxdInstance;
    void updateInstance(instanceMinusIso, project ?? "").then((operation) => {
      eventQueue.set(
        operation.metadata.id,
        () =>
          notify.success(
            <>
              ISO <b>{attachedIso?.source ?? ""}</b> detached
            </>,
          ),
        (msg) => notify.failure("Detach ISO failed", new Error(msg)),
        () => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances, instance.name, project],
          });
          setLoading(false);
        },
      );
    });
  };

  const handleSelect = (image: RemoteImage) => {
    setLoading(true);
    closePortal();
    const values = getInstanceEditValues(instance);
    const isoDevice = remoteImageToIsoDevice(image);
    values.devices.push(isoDevice);
    const instancePlusIso = getInstancePayload(instance, values) as LxdInstance;
    void updateInstance(instancePlusIso, project ?? "").then((operation) => {
      eventQueue.set(
        operation.metadata.id,
        () =>
          notify.success(
            <>
              ISO <b>{image.aliases}</b> attached
            </>,
          ),
        (msg) => notify.failure("Attaching ISO failed", new Error(msg)),
        () => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances, instance.name, project],
          });
          setLoading(false);
        },
      );
    });
  };

  return attachedIso ? (
    <>
      <span className="u-text--muted margin-right">{attachedIso.source}</span>
      <ActionButton
        loading={isLoading}
        onClick={detachIso}
        className="u-no-margin--bottom"
      >
        Detach ISO
      </ActionButton>
    </>
  ) : (
    <>
      <ActionButton
        loading={isLoading}
        onClick={openPortal}
        className="u-no-margin--bottom"
      >
        Attach ISO
      </ActionButton>
      {isOpen && (
        <Portal>
          <CustomIsoModal onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default AttachIsoBtn;
