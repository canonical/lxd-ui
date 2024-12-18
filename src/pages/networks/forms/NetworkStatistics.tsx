import { FC } from "react";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { humanFileSize } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworkState } from "api/networks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkStatistics: FC<Props> = ({ formik, project }) => {
  const { data: networkState } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      formik.values.bareNetwork?.name,
      queryKeys.state,
    ],
    retry: 0, // physical managed networks can sometimes 404, show error right away and don't retry
    queryFn: () =>
      fetchNetworkState(formik.values.bareNetwork?.name ?? "", project),
    enabled: !formik.values.isCreating,
  });

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
      <div className="general-field">
        <div className="general-field-label">Status</div>
        <div className="general-field-content">
          {formik.values.bareNetwork?.status ?? "-"}
        </div>
      </div>
    </>
  );
};

export default NetworkStatistics;
