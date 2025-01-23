import { FC, useEffect } from "react";
import {
  Button,
  Icon,
  Label,
  Select,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworksFromClusterMembers, fetchNetworks } from "api/networks";
import { useParams } from "react-router-dom";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import ClusterSpecificSelect, {
  ClusterSpecificSelectOption,
} from "components/ClusterSpecificSelect";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  props?: Record<string, unknown>;
  formik: FormikProps<NetworkFormValues>;
  isClustered: boolean;
}

const NetworkParentSelector: FC<Props> = ({ props, formik, isClustered }) => {
  const { project } = useParams<{ project: string }>();
  const { data: clusterMembers = [] } = useClusterMembers();
  const notify = useNotify();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: networks = [],
    error: networkError,
    isLoading: isNetworkLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, project],
    queryFn: () => fetchNetworks(project),
    enabled: !isClustered,
  });

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  const {
    data: networksOnClusterMembers = [],
    error: clusterNetworkError,
    isLoading: isClusterNetworksLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, "default", queryKeys.cluster],
    queryFn: () => fetchNetworksFromClusterMembers("default", clusterMembers),
    enabled: clusterMembers.length > 0,
  });

  useEffect(() => {
    if (clusterNetworkError) {
      notify.failure("Loading cluster networks failed", clusterNetworkError);
    }
  }, [clusterNetworkError]);

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

    const options: ClusterSpecificSelectOption[] = [];
    clusterMembers.forEach((member) =>
      options.push({
        memberName: member.server_name,
        values: networksOnClusterMembers
          .filter(
            (item) =>
              item.memberName === member.server_name && item.managed === false,
          )
          .map((item) => item.name),
      }),
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
            options={options}
            values={formik.values.parentPerClusterMember}
            onChange={(value) =>
              void formik.setFieldValue("parentPerClusterMember", value)
            }
            isReadOnly={formik.values.readOnly}
            toggleReadOnly={() => {
              ensureEditMode(formik);
              focusField("parent");
            }}
            isDefaultSpecific={currentValues.some(
              (item) => item !== currentValues[0],
            )}
            clusterMemberLinkTarget={(member) =>
              `/ui/project/${project}/networks?member=${member}`
            }
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
