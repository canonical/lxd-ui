import { FC } from "react";
import { Button, Icon, Label, Select } from "@canonical/react-components";
import Loader from "components/Loader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchClusterMemberNetworks, fetchNetworks } from "api/networks";
import { useParams } from "react-router-dom";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import ClusterSpecificSelect from "components/ClusterSpecificSelect";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  props?: Record<string, unknown>;
  formik: FormikProps<NetworkFormValues>;
  isClustered: boolean;
}

const NetworkParentSelector: FC<Props> = ({ props, formik, isClustered }) => {
  const { project } = useParams<{ project: string }>();
  const { data: clusterMembers = [] } = useClusterMembers();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: networks = [], isLoading: isNetworkLoading } = useQuery({
    queryKey: [queryKeys.networks, project],
    queryFn: () => fetchNetworks(project),
    enabled: !isClustered,
  });

  const {
    data: clusterMemberNetworks = [],
    isLoading: isClusterNetworksLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, "default", queryKeys.cluster],
    queryFn: () => fetchClusterMemberNetworks("default", clusterMembers),
    enabled: clusterMembers.length > 0,
  });

  const options = networks
    .filter((network) => network.managed === false)
    .map((network) => {
      return {
        label: network.name,
        value: network.name,
      };
    });
  options.unshift({
    label: options.length === 0 ? "No networks available" : "Select option",
    value: "",
  });

  if (isNetworkLoading || isClusterNetworksLoading) {
    return <Loader />;
  }

  if (isClustered) {
    const currentValues = Object.values(
      formik.values.parentPerClusterMember ?? {},
    );

    return (
      <div className="general-field">
        <div className="general-field-label can-edit">
          <Label forId="parent" required={formik.values.isCreating}>
            Parent
          </Label>
        </div>
        <div className="general-field-content">
          <ClusterSpecificSelect
            id="parent"
            options={clusterMemberNetworks.map((item) => {
              const memberOptions = item.memberNetworks
                .filter((network) => network.managed === false)
                .map((network) => network.name);

              return {
                memberName: item.memberName,
                values: memberOptions,
              };
            })}
            values={formik.values.parentPerClusterMember}
            onChange={(value) => {
              void formik.setFieldValue("parentPerClusterMember", value);
            }}
            isReadOnly={formik.values.readOnly}
            toggleReadOnly={() => {
              ensureEditMode(formik);
              focusField("parent");
            }}
            isDefaultSpecific={currentValues.some(
              (item) => item !== currentValues[0],
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="parent" required={formik.values.isCreating}>
          Parent
        </Label>
      </div>
      <div className="general-field-content">
        {formik.values.readOnly ? (
          <>
            {formik.values.parent}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("parent");
              }}
              className="u-no-margin--bottom"
              type="button"
              appearance="base"
              title="Edit"
              hasIcon
            >
              <Icon name="edit" />
            </Button>
          </>
        ) : (
          <Select
            help="Existing interface to use for network"
            options={options}
            {...props}
          />
        )}
      </div>
    </div>
  );
};

export default NetworkParentSelector;
