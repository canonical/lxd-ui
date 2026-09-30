import { useState, type FC } from "react";
import { RadioInput } from "@canonical/react-components";
import classnames from "classnames";
import type { FormikProps } from "formik/dist/types";
import ImageRegistrySelector from "pages/images/ImageRegistrySelector";
import type {
  ProjectFormValues,
  RegistryRestrictionMode,
} from "types/forms/project";
import { REGISTRY_KEYWORDS } from "util/imageRegistry";

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const modeOptions: {
  mode: RegistryRestrictionMode;
  label: string;
  value: string;
}[] = [
  {
    mode: "builtin",
    label: "Built-in registries only (default)",
    value: REGISTRY_KEYWORDS.BUILTIN,
  },
  {
    mode: "allow",
    label: "Allow all registries",
    value: REGISTRY_KEYWORDS.ALLOW,
  },
  {
    mode: "block",
    label: "Block all registries",
    value: REGISTRY_KEYWORDS.BLOCK,
  },
  // starts empty until registries are picked; validation blocks saving it
  { mode: "custom", label: "Custom registries selection", value: "" },
];

const ImageRegistryRestrictionInput: FC<Props> = ({ formik }) => {
  const [openCustomSelector, setOpenCustomSelector] = useState(false);
  const currentMode = formik.values.restricted_registries_mode;
  const registryError = formik.errors.restricted_registries;

  return (
    <div className="image-registry-restriction-input">
      {modeOptions.map(({ mode, label, value: modeValue }) => (
        <RadioInput
          key={mode}
          name="restricted_registries_mode"
          label={label}
          checked={currentMode === mode}
          onChange={() => {
            setOpenCustomSelector(mode === "custom");
            void formik.setValues({
              ...formik.values,
              restricted_registries_mode: mode,
              restricted_registries: modeValue,
            });
          }}
          disabled={!!formik.values.editRestriction}
        />
      ))}
      {currentMode === "custom" && (
        <div
          className={classnames({
            "p-form-validation is-error": registryError,
          })}
        >
          <ImageRegistrySelector
            formik={formik}
            openOnMount={openCustomSelector}
          />
          {registryError && (
            <p className="p-form-validation__message">
              <strong>Error:</strong> {registryError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageRegistryRestrictionInput;
