import { FC, FormEvent } from "react";
import { Switch } from "@canonical/react-components";
import YamlConfirmation from "components/forms/YamlConfirmation";
import { slugify } from "util/slugify";
import {
  MAIN_CONFIGURATION,
  YAML_CONFIGURATION,
} from "pages/instances/forms/InstanceFormMenu";
import usePortal from "react-useportal";
import { FormikProps } from "formik/dist/types";
import classnames from "classnames";

interface Props {
  section?: string;
  setSection: (section: string) => void;
  formik: unknown;
  disableReason?: string;
}

const YamlSwitch: FC<Props> = ({
  section,
  setSection,
  formik,
  disableReason,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const yamlFormik = formik as FormikProps<{ yaml: string }>;

  const isChecked = slugify(section ?? "") === slugify(YAML_CONFIGURATION);

  const handleSwitch = (e: FormEvent) => {
    if (yamlFormik.values.yaml) {
      return openPortal(e);
    }

    const newSection = isChecked ? MAIN_CONFIGURATION : YAML_CONFIGURATION;
    setSection(newSection);
  };

  const handleConfirm = () => {
    void yamlFormik.setFieldValue("yaml", undefined);
    closePortal();
    setSection(MAIN_CONFIGURATION);
  };

  return (
    <div
      title={disableReason}
      className={classnames("u-float-left", { "is-disabled": disableReason })}
    >
      {isOpen && (
        <Portal>
          <YamlConfirmation onConfirm={handleConfirm} close={closePortal} />
        </Portal>
      )}
      <Switch
        label="YAML Configuration"
        checked={isChecked}
        onChange={handleSwitch}
        disabled={disableReason !== undefined}
      />
    </div>
  );
};

export default YamlSwitch;
