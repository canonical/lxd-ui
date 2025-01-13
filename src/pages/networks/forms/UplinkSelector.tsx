import { FC } from "react";
import { Button, Icon, Label, Select } from "@canonical/react-components";
import Loader from "components/Loader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { fetchProject } from "api/projects";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

const UPLINK_NETWORK_TYPES = ["bridge", "physical"];

interface Props {
  project: string;
  props?: Record<string, unknown>;
  formik: FormikProps<NetworkFormValues>;
}

const UplinkSelector: FC<Props> = ({ project: projectName, props, formik }) => {
  const { data: networks = [], isLoading: isNetworkLoading } = useQuery({
    queryKey: [queryKeys.networks, "default"],
    queryFn: () => fetchNetworks("default"),
  });

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [queryKeys.projects, projectName],
    queryFn: () => fetchProject(projectName),
  });

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
