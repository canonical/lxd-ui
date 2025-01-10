import { FC, useEffect } from "react";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworkState } from "api/networks";
import { MainTable, useNotify } from "@canonical/react-components";
import { useParams } from "react-router-dom";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkAddresses: FC<Props> = ({ formik, project }) => {
  const { member } = useParams<{ member: string }>();
  const notify = useNotify();

  const networkName = formik.values.bareNetwork?.name ?? "";

  const { data: networkState, error } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      networkName,
      queryKeys.members,
      member,
      queryKeys.state,
    ],
    retry: 0, // physical managed networks can sometimes 404, show error right away and don't retry
    queryFn: () => fetchNetworkState(networkName, project, member),
  });

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
                  role: "cell",
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
