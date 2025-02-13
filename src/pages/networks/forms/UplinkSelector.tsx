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
import { fetchNetworks } from "api/networks";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useProject } from "context/useProjects";

const UPLINK_NETWORK_TYPES = ["bridge", "physical"];

interface Props {
  project: string;
  props?: Record<string, unknown>;
  formik: FormikProps<NetworkFormValues>;
}

const UplinkSelector: FC<Props> = ({ project: projectName, props, formik }) => {
  const notify = useNotify();

  const {
    data: networks = [],
    error: networkError,
    isLoading: isNetworkLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, "default"],
    queryFn: () => fetchNetworks("default"),
  });

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  const {
    data: project,
    error: projectError,
    isLoading: isProjectLoading,
  } = useProject(projectName);

  useEffect(() => {
    if (projectError) {
      notify.failure("Loading projects failed", projectError);
    }
  }, [projectError]);

  const availableUplinks =
    project?.config?.["restricted.networks.uplinks"]?.split(",") ||
    networks
      .filter(
        (network) =>
          UPLINK_NETWORK_TYPES.includes(network.type) && network.managed,
      )
      .map((network) => network.name);

  const options = availableUplinks.map((name) => {
    return {
      label: name,
      value: name,
    };
  });
  options.unshift({
    label: options.length === 0 ? "No networks available" : "Select option",
    value: "",
  });

  if (isNetworkLoading || isProjectLoading) {
    return <Loader />;
  }

  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="network" required={formik.values.isCreating}>
          Uplink
        </Label>
      </div>
      <div className="general-field-content">
        {formik.values.readOnly ? (
          <>
            {formik.values.network}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("uplink");
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
            help="Uplink network to use for external network access"
            options={options}
            required
            {...props}
          />
        )}
      </div>
    </div>
  );
};

export default UplinkSelector;
