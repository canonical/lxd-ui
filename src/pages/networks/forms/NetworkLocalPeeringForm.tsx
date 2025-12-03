import type { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import type { LxdNetwork } from "types/network";
import { useNetworkEntitlements } from "util/entitlements/networks";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import { useNetworks } from "context/useNetworks";
import { typesWithLocalPeerings } from "util/networks";
import { useProjects } from "context/useProjects";
import ProjectSelector from "./ProjectSelector";

export interface LocalPeeringFormValues {
  name: string;
  targetProject: string;
  targetNetwork: string;
  description?: string;
  customTargetProject?: string;
  customTargetNetwork?: string;
  createMutualPeering?: boolean;
}

interface Props {
  formik: FormikProps<LocalPeeringFormValues>;
  network: LxdNetwork;
  isEditing?: boolean;
}

const NetworkLocalPeeringForm: FC<Props> = ({ formik, network, isEditing }) => {
  const projectOtherLabel = "Manually enter project";
  const networkOtherLabel = "Manually enter network";
  const { canEditNetwork } = useNetworkEntitlements();
  const { data: projects = [] } = useProjects();
  const { data: networks = [] } = useNetworks(
    formik.values.targetProject || "default",
    undefined,
    formik.values.targetProject === projectOtherLabel ? false : undefined,
  );
  const projectList = [
    ...projects,
    { name: projectOtherLabel, config: {}, description: "" },
  ];

  const managedNetworks = networks
    .filter((item) => typesWithLocalPeerings.includes(item.type))
    .filter((item) => item.name !== network.name);

  const networkList = [
    ...managedNetworks,
    { name: networkOtherLabel, type: "ovn", config: {} } as LxdNetwork,
  ];

  const getFormProps = (
    id:
      | "name"
      | "description"
      | "targetProject"
      | "targetNetwork"
      | "customTargetProject"
      | "customTargetNetwork",
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

  const editRestriction = canEditNetwork(network)
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
        autoFocus={!isEditing}
        disabled={isEditing || !!editRestriction}
        title="Name cannot be changed"
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="Description"
        disabled={!!editRestriction}
        title={editRestriction}
        autoFocus={isEditing}
      />
      {isEditing ? (
        <Input
          id="targetProject"
          type="text"
          label="Target project"
          value={formik.values.targetProject}
          title="Target project cannot be changed"
          required
          disabled
        />
      ) : (
        <ProjectSelector
          id="targetProject"
          name="targetProject"
          label="Target project"
          value={formik.values.targetProject}
          setValue={(value) => {
            formik.setFieldValue("targetProject", value, false);
            formik.setFieldValue("customTargetProject", "", false);
            if (value === projectOtherLabel) {
              formik.setFieldValue("targetNetwork", networkOtherLabel, false);
            } else {
              formik.setFieldValue("targetNetwork", "", false);
            }
            formik.setFieldValue("customTargetNetwork", "", false);
            formik.setFieldValue("createMutualPeering", false, false);
            setTimeout(() => {
              formik.validateForm();
            }, 100);
          }}
          disabled={!!editRestriction}
          projects={projectList}
          required
        />
      )}

      {formik.values.targetProject === projectOtherLabel && (
        <Input
          id="customTargetProject"
          name="customTargetProject"
          type="text"
          placeholder="Enter target project name"
          value={formik.values.customTargetProject}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      )}

      {isEditing ? (
        <Input
          id="targetNetwork"
          type="text"
          label="Target network"
          value={formik.values.targetNetwork}
          title="Target network cannot be changed"
          required
          disabled
        />
      ) : (
        formik.values.targetProject &&
        formik.values.targetProject !== projectOtherLabel && (
          <NetworkSelector
            id="targetNetwork"
            name="targetNetwork"
            label="Target network"
            value={formik.values.targetNetwork}
            setValue={(value) => {
              formik.setFieldValue("targetNetwork", value, false);
              if (value === networkOtherLabel) {
                formik.setFieldValue("createMutualPeering", false, true);
              } else {
                formik.setFieldValue("customTargetNetwork", "", false);
                formik.setFieldValue("createMutualPeering", true, false);
              }
              setTimeout(() => {
                formik.validateForm();
              }, 100);
            }}
            networkList={networkList}
            help={
              formik.values.targetNetwork !== networkOtherLabel &&
              "Peering is limited to intra-cluster OVN networks; non-OVN or cross-cluster network peering is not supported."
            }
            required
          />
        )
      )}

      {(formik.values.targetNetwork === networkOtherLabel ||
        formik.values.targetProject === projectOtherLabel) && (
        <Input
          id="customTargetNetwork"
          name="customTargetNetwork"
          type="text"
          label={
            (formik.values.targetNetwork !== networkOtherLabel ||
              formik.values.targetProject === projectOtherLabel) &&
            "Target network"
          }
          placeholder="Enter target network name"
          value={formik.values.customTargetNetwork}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          help="Peering is limited to intra-cluster OVN networks; non-OVN or cross-cluster network peering is not supported."
          required
        />
      )}

      {!isEditing && (
        <Input
          id="createMutualPeering"
          name="createMutualPeering"
          type="checkbox"
          label="Create mutual peering"
          checked={formik.values.createMutualPeering}
          onChange={(e) => {
            formik.setFieldValue("createMutualPeering", e.target.checked);
          }}
          disabled={
            formik.values.targetNetwork === networkOtherLabel ||
            formik.values.targetProject === projectOtherLabel
          }
          title={
            formik.values.targetNetwork === networkOtherLabel ||
            formik.values.targetProject === projectOtherLabel
              ? "Unavailable when using manual network or project entry"
              : ""
          }
        />
      )}
    </Form>
  );
};

export default NetworkLocalPeeringForm;
