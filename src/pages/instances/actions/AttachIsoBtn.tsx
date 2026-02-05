import type { FC } from "react";
import { useState } from "react";
import { updateInstance } from "api/instances";
import type { LxdInstance } from "types/instance";
import { useParams } from "react-router-dom";
import {
  ActionButton,
  useToastNotification,
  usePortal,
} from "@canonical/react-components";
import { getInstanceEditValues, getInstancePayload } from "util/instanceEdit";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { RemoteImage } from "types/image";
import CustomIsoModal from "pages/images/CustomIsoModal";
import type { FormDiskDevice } from "types/formDevice";
import { remoteImageToIsoDevice } from "util/formDevices";
import { useEventQueue } from "context/eventQueue";
import { instanceLinkFromOperation } from "util/instances";
import ResourceLink from "components/ResourceLink";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { InstanceRichChip } from "../InstanceRichChip";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  instance: LxdInstance;
}

const AttachIsoBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const { project } = useParams<{ project: string }>();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [isLoading, setLoading] = useState(false);
  const { canEditInstance } = useInstanceEntitlements();

  const attachedIso = getInstanceEditValues(instance).devices.find((device) => {
    return device.name === "iso-volume";
  }) as FormDiskDevice | undefined;

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
    const instanceLink = (
      <InstanceRichChip
        instanceName={instance.name}
        projectName={instance.project}
      />
    );
    updateInstance(instanceMinusIso, project ?? "")
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () =>
            toastNotify.success(
              <>
                ISO{" "}
                <ResourceLink
                  to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project ?? "")}/storage/custom-isos`}
                  type="iso-volume"
                  value={attachedIso?.bare?.source ?? ""}
                />{" "}
                detached from {instanceLink}
              </>,
            ),
          (msg) =>
            toastNotify.failure(
              "Detaching ISO failed.",
              new Error(msg),
              instanceLink,
            ),
          () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.instances, instance.name, project],
            });
            setLoading(false);
          },
        );
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("Detaching ISO failed.", e, instanceLink);
      });
  };

  const handleSelect = (image: RemoteImage) => {
    setLoading(true);
    closePortal();
    const values = getInstanceEditValues(instance);
    const isoDevice = remoteImageToIsoDevice(image);
    values.devices.push(isoDevice);
    const instancePlusIso = getInstancePayload(instance, values) as LxdInstance;
    updateInstance(instancePlusIso, project ?? "")
      .then((operation) => {
        const instanceLink = instanceLinkFromOperation({
          operation,
          project,
        });
        eventQueue.set(
          operation.metadata.id,
          () =>
            toastNotify.success(
              <>
                ISO{" "}
                <ResourceLink
                  to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project ?? "")}/storage/custom-isos`}
                  type="iso-volume"
                  value={image.aliases}
                />{" "}
                attached to {instanceLink}
              </>,
            ),
          (msg) =>
            toastNotify.failure(
              "Attaching ISO failed.",
              new Error(msg),
              instanceLink,
            ),
          () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.instances, instance.name, project],
            });
            setLoading(false);
          },
        );
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("Attaching ISO failed.", e);
      });
  };

  const disabledReason = canEditInstance(instance)
    ? undefined
    : "You do not have permission to edit this instance.";

  return attachedIso ? (
    <>
      <span className="u-text--muted margin-right">
        {attachedIso?.bare?.source}
      </span>
      <ActionButton
        loading={isLoading}
        onClick={detachIso}
        className="u-no-margin--bottom"
        disabled={!!disabledReason || isLoading}
        title={disabledReason}
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
        disabled={!!disabledReason || isLoading}
        title={disabledReason}
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
