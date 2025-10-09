import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Icon,
  Label,
  Select,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { useParams } from "react-router-dom";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { ClusterSpecificSelectOption } from "components/ClusterSpecificSelect";
import ClusterSpecificSelect from "components/ClusterSpecificSelect";
import { useClusterMembers } from "context/useClusterMembers";
import {
  useNetworks,
  useNetworksFromClusterMembers,
} from "context/useNetworks";
import { macvlanType, sriovType } from "util/networks";

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

  const networksQueryEnabled = !isClustered;
  const {
    data: networks = [],
    error: networkError,
    isLoading: isNetworkLoading,
  } = useNetworks(project, undefined, networksQueryEnabled);

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  const {
    data: networksOnClusterMembers = [],
    error: clusterNetworkError,
    isLoading: isClusterNetworksLoading,
  } = useNetworksFromClusterMembers("default");

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
    return <Spinner className="u-loader" text="Loading..." />;
  }

  const getHelpText = () => {
    if (formik.values.networkType === macvlanType) {
      return (
        <>
          Parent interface to create <code>Macvlan</code> NICs on
        </>
      );
    }

    if (formik.values.networkType === sriovType) {
      return (
        <>
          Parent interface to create <code>SR-IOV</code> NICs on
        </>
      );
    }

    return "Existing interface to use for network";
  };

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
            key={JSON.stringify(formik.values.parentPerClusterMember)}
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
            disableReason={formik.values.editRestriction}
            helpText={getHelpText()}
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
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
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
              title={formik.values.editRestriction ?? "Edit"}
              hasIcon
              disabled={!!formik.values.editRestriction}
            >
              <Icon name="edit" />
            </Button>
          </>
        ) : (
          <Select help={getHelpText()} options={options} {...props} />
        )}
      </div>
    </div>
  );
};

export default NetworkParentSelector;
