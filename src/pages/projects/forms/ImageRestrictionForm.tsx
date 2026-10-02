import { useState, type FC, type ReactNode } from "react";
import { RadioInput } from "@canonical/react-components";
import type { FormikErrors } from "formik";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import ResourceLink from "components/ResourceLink";
import type {
  ImageRestrictionFormValues,
  ProjectFormValues,
  RegistryRestrictionMode,
} from "types/forms/project";
import type { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import ImageRegistrySelector from "pages/images/ImageRegistrySelector";
import {
  getRegistryRestrictionMode,
  REGISTRY_KEYWORD_ALLOW,
  REGISTRY_KEYWORD_BLOCK,
  REGISTRY_KEYWORD_BUILTIN,
} from "util/imageRegistry";
import { ROOT_PATH } from "util/rootPath";
import classnames from "classnames";

export const imageRestrictionPayload = (
  values: ImageRestrictionFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_registries")]: values.restricted_registries,
  };
};

export const validateImageRestriction = (
  values: ProjectFormValues,
): FormikErrors<ProjectFormValues> => {
  if (values.restricted && values.restricted_registries === "") {
    return { restricted_registries: "Select at least one registry" };
  }
  return {};
};

const modeOptions: {
  mode: RegistryRestrictionMode;
  label: string;
  value: string;
}[] = [
  {
    mode: "builtin",
    label: "Built-in registries only (default)",
    value: REGISTRY_KEYWORD_BUILTIN,
  },
  {
    mode: "allow",
    label: "Allow all registries",
    value: REGISTRY_KEYWORD_ALLOW,
  },
  {
    mode: "block",
    label: "Block all registries",
    value: REGISTRY_KEYWORD_BLOCK,
  },
  // starts empty until registries are picked; validation blocks saving it
  { mode: "custom", label: "Custom registries selection", value: "" },
];

const renderRegistries = (value: ReactNode): ReactNode => {
  // "-" is the configuration row's placeholder for an empty value
  if (typeof value !== "string" || value === "-") {
    return value;
  }

  switch (value) {
    case REGISTRY_KEYWORD_BUILTIN:
      return "Built-in registries only";
    case REGISTRY_KEYWORD_ALLOW:
      return "All registries";
    case REGISTRY_KEYWORD_BLOCK:
      return "No registries";
  }

  const registries = value.split(",").filter(Boolean);
  const hasBuiltin = registries.includes(REGISTRY_KEYWORD_BUILTIN);
  const customRegistries = registries.filter(
    (registry) => registry !== REGISTRY_KEYWORD_BUILTIN,
  );

  return (
    <div className="restricted-image-registries">
      {hasBuiltin && <div>Built-in registries</div>}
      {customRegistries.length > 0 && (
        <div>
          {customRegistries.map((registry) => (
            <ResourceLink
              key={registry}
              type="image-registry"
              value={registry}
              to={`${ROOT_PATH}/ui/image-registry/${encodeURIComponent(registry)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ImageRegistryRestrictionInput: FC<Props> = ({ formik }) => {
  const value = formik.values.restricted_registries;
  const [isCustom, setCustom] = useState(
    getRegistryRestrictionMode(value) === "custom",
  );
  const currentMode = isCustom ? "custom" : getRegistryRestrictionMode(value);

  return (
    <div className="image-registry-restriction-input">
      {modeOptions.map(({ mode, label, value: modeValue }) => (
        <RadioInput
          key={mode}
          name="restricted_registries_mode"
          label={label}
          checked={currentMode === mode}
          onChange={() => {
            setCustom(mode === "custom");
            void formik.setFieldValue("restricted_registries", modeValue);
          }}
          disabled={!!formik.values.editRestriction}
        />
      ))}
      {currentMode === "custom" && (
        <div
          className={classnames({
            "p-form-validation is-error": formik.errors.restricted_registries,
          })}
        >
          <ImageRegistrySelector formik={formik} />
          {formik.errors.restricted_registries && (
            <p className="p-form-validation__message">
              <strong>Error:</strong> {formik.errors.restricted_registries}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ImageRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_registries",
          label: "Available image registries",
          help: "Which image registries can be used in this project",
          defaultValue: REGISTRY_KEYWORD_BUILTIN,
          children: <ImageRegistryRestrictionInput formik={formik} />,
          readOnlyRenderer: renderRegistries,
        }),
      ]}
    />
  );
};

export default ImageRestrictionForm;
