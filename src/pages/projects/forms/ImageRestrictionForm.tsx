import type { FC, ReactNode } from "react";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type {
  ImageRestrictionFormValues,
  ProjectFormValues,
} from "types/forms/project";
import type { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import ImageRegistrySelector from "pages/images/ImageRegistrySelector";
import ResourceLink from "components/ResourceLink";
import { ROOT_PATH } from "util/rootPath";

export const imageRestrictionPayload = (
  values: ImageRestrictionFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_registries")]: values.restricted_registries,
  };
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
          defaultValue: "",
          children: <ImageRegistrySelector formik={formik} />,
          readOnlyRenderer: (val): ReactNode => {
            if (val === "block" || typeof val !== "string") {
              return val;
            }

            const registries = val.split(",").filter(Boolean);
            return (
              <span className="restricted-image-registries">
                {registries?.map((registry) => (
                  <ResourceLink
                    key={registry}
                    type="image-registry"
                    value={registry}
                    to={`${ROOT_PATH}/ui/image-registry/${registry}`}
                  />
                ))}
              </span>
            );
          },
        }),
      ]}
    />
  );
};

export default ImageRestrictionForm;
