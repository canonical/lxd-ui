import { useState, type FC, type ReactNode } from "react";
import { CheckboxInput, Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import type { LxdNetwork } from "types/network";
import { useNetworkEntitlements } from "util/entitlements/networks";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import { useNetworks } from "context/useNetworks";
import { useCurrentProject } from "context/useCurrentProject";
import { ovnType } from "util/networks";
import { useProjects } from "context/useProjects";
import SelectableProjectSelector from "./SelectableProjectSelector";

export interface LocalPeeringFormValues {
  name: string;
  targetProject: string;
  targetNetwork: string;
  description?: string;
}

interface Props {
  formik: FormikProps<LocalPeeringFormValues>;
  network: LxdNetwork;
  isEditing?: boolean;
}

const NetworkLocalPeeringForm: FC<Props> = ({ formik, network, isEditing }) => {
  const { canEditNetwork } = useNetworkEntitlements();
  const { project } = useCurrentProject();
  const { data: projects = [] } = useProjects();
  const { data: networks = [] } = useNetworks(project?.name || "default");
  const [isChecked, setIsChecked] = useState(false);
  const managedNetworks = networks
    .filter((network_) => network_.type === ovnType)
    .filter((network_) => network_.name !== network.name);

  const getFormProps = (
    id: "name" | "description" | "targetProject" | "targetNetwork",
  ) => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("-", " ")}`,
    };
  };

  const LPEditRestriction = canEditNetwork(network)
    ? ""
    : "You do not have permission to edit this network";

  return (
    <Form
      onSubmit={formik.handleSubmit}
      className={"local-peering-create-form"}
    >
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="Name"
        required
        autoFocus
        disabled={isEditing || !!LPEditRestriction}
        title={LPEditRestriction}
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="Description"
        disabled={!!LPEditRestriction}
        title={LPEditRestriction}
      />
      <SelectableProjectSelector
        id="targetProject"
        name="targetProject"
        label="Target project"
        value={formik.values.targetProject}
        setValue={(value) => {
          formik.setFieldValue("targetProject", value);
        }}
        disabled={isEditing || !!LPEditRestriction}
        projects={projects}
        required
      />
      <NetworkSelector
        id="targetNetwork"
        name="targetNetwork"
        label="Target network"
        value={formik.values.targetNetwork}
        setValue={(value) => {
          formik.setFieldValue("targetNetwork", value);
        }}
        disabled={isChecked || isEditing || !!LPEditRestriction}
        managedNetworks={managedNetworks}
        required={!isChecked}
        help={
          "Peering is limited to intra-cluster OVN networks; non-OVN or cross-cluster network peering is not supported."
        }
      />

      <CheckboxInput
        id={`local-peering-network-checkbox`}
        label="I don't have access to the target network"
        checked={isChecked}
        onChange={() => {
          setIsChecked((val) => !val);
        }}
        disabled={isEditing || !!LPEditRestriction}
        title={LPEditRestriction}
      />

      {isChecked && (
        <Input
          {...getFormProps("targetNetwork")}
          type="text"
          placeholder="Enter target network name"
          required={isChecked}
          disabled={!isChecked || isEditing || !!LPEditRestriction}
          title={LPEditRestriction}
        />
      )}
    </Form>
  );
};

export default NetworkLocalPeeringForm;
