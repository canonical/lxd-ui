import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Icon,
  Label,
  Select,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useProject } from "context/useProjects";
import { useNetworks } from "context/useNetworks";
import { typesForUplink } from "util/networks";

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
  } = useNetworks("default");

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
        (network) => typesForUplink.includes(network.type) && network.managed,
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
    return <Spinner className="u-loader" text="Loading..." />;
  }

  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="network" required={formik.values.isCreating}>
          Uplink
        </Label>
      </div>
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
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
              title={formik.values.editRestriction ?? "Edit"}
              hasIcon
              disabled={!!formik.values.editRestriction}
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
