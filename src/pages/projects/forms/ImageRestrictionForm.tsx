import { type FC, type ReactNode } from "react";
import type { FormikErrors, FormikProps } from "formik";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import ResourceLink from "components/ResourceLink";
import ImageRegistryRestrictionInput from "pages/projects/forms/ImageRegistryRestrictionInput";
import type {
  ImageRestrictionFormValues,
  ProjectFormValues,
} from "types/forms/project";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import { REGISTRY_KEYWORDS } from "util/imageRegistry";
import { ROOT_PATH } from "util/rootPath";

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
  if (
    values.restricted &&
    values.restricted_registries_mode === "custom" &&
    values.restricted_registries === ""
  ) {
    return { restricted_registries: "Select at least one registry" };
  }
  return {};
};

const renderRegistries = (value: ReactNode): ReactNode => {
  if (value === "-") {
    return "Built-in registries only";
  }
  if (typeof value !== "string") {
    return value;
  }

  switch (value) {
    case REGISTRY_KEYWORDS.BUILTIN:
    case "":
      return "Built-in registries only";
    case REGISTRY_KEYWORDS.ALLOW:
      return "All registries";
    case REGISTRY_KEYWORDS.BLOCK:
      return "No registries";
  }

  const registries = value.split(",").filter(Boolean);
  const hasBuiltin = registries.includes(REGISTRY_KEYWORDS.BUILTIN);
  const customRegistries = registries.filter(
    (registry) => registry !== REGISTRY_KEYWORDS.BUILTIN,
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

const ImageRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_registries",
          label: "Available image registries",
          defaultValue: REGISTRY_KEYWORDS.BUILTIN,
          children: <ImageRegistryRestrictionInput formik={formik} />,
          readOnlyRenderer: renderRegistries,
        }),
      ]}
    />
  );
};

export default ImageRestrictionForm;
