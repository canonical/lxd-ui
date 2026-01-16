import type { FC } from "react";
import { useEffect } from "react";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { humanFileSize } from "util/helpers";
import { useParams } from "react-router-dom";
import { useNotify } from "@canonical/react-components";
import { useNetworkState } from "context/useNetworks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkStatistics: FC<Props> = ({ formik, project }) => {
  const { member } = useParams<{ member: string }>();
  const notify = useNotify();

  const { data: networkState, error } = useNetworkState(
    formik.values.bareNetwork?.name ?? "",
    project,
    member,
    !formik.values.isCreating,
  );

  useEffect(() => {
    if (error) {
      notify.failure("Loading network state failed", error);
    }
  }, [error]);

  const isManagedNetwork = formik.values.bareNetwork?.managed ?? true;

  return (
    <>
      <div className="general-field">
        <div className="general-field-label">RX</div>
        <div className="general-field-content">
          {humanFileSize(networkState?.counters.bytes_received ?? 0)} (
          {networkState?.counters.packets_received ?? 0} packets)
        </div>
      </div>
      <div className="general-field">
        <div className="general-field-label">TX</div>
        <div className="general-field-content">
          {humanFileSize(networkState?.counters.bytes_sent ?? 0)} (
          {networkState?.counters.packets_sent ?? 0} packets)
        </div>
      </div>
      {isManagedNetwork && (
        <div className="general-field">
          <div className="general-field-label">Status</div>
          <div className="general-field-content">
            {formik.values.bareNetwork?.status ?? "-"}
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatistics;
