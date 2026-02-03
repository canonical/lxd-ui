import type { FC } from "react";
import { useEffect } from "react";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "types/forms/network";
import { MainTable, useNotify } from "@canonical/react-components";
import { useParams } from "react-router-dom";
import { useNetworkState } from "context/useNetworks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkAddresses: FC<Props> = ({ formik, project }) => {
  const { member } = useParams<{ member: string }>();
  const notify = useNotify();

  const networkName = formik.values.bareNetwork?.name ?? "";

  const { data: networkState, error } = useNetworkState(
    networkName,
    project,
    member,
  );

  useEffect(() => {
    if (error) {
      notify.failure("Loading network state failed", error);
    }
  }, [error]);

  return (
    <>
      <h2 className="p-heading--4">Addresses</h2>
      {(networkState?.addresses ?? []).length > 0 ? (
        <MainTable
          sortable
          headers={[
            { content: "IP", sortKey: "ip" },
            { content: "Netmask", sortKey: "netmask" },
            { content: "Scope", sortKey: "scope" },
            { content: "Family", sortKey: "family" },
          ]}
          rows={networkState?.addresses.map((item) => {
            return {
              key: item.address,
              columns: [
                {
                  content: item.address,
                  role: "rowheader",
                  "aria-label": "Address",
                },
                {
                  content: item.netmask,
                  role: "cell",
                  "aria-label": "Netmask",
                },
                {
                  content: item.scope,
                  role: "cell",
                  "aria-label": "Scope",
                },
                {
                  content: item.family,
                  role: "cell",
                  "aria-label": "family",
                },
              ],
              sortData: {
                ip: item.address,
                netmask: item.netmask,
                scope: item.scope,
                family: item.family,
              },
            };
          })}
        />
      ) : (
        "None"
      )}
    </>
  );
};

export default NetworkAddresses;
