import { useEffect, useRef, type FC, type FormEvent } from "react";
import { Switch, usePortal } from "@canonical/react-components";
import YamlConfirmation from "components/forms/YamlConfirmation";
import { slugify } from "util/slugify";
import {
  MAIN_CONFIGURATION,
  YAML_CONFIGURATION,
} from "pages/instances/forms/InstanceFormMenu";
import type { FormikProps } from "formik/dist/types";
import classnames from "classnames";
import { useIsScreenBelow } from "context/useIsScreenBelow";

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
  const isSmallScreen = useIsScreenBelow();
  const isYamlSection = slugify(section ?? "") === slugify(YAML_CONFIGURATION);
  const previousSection = useRef<string>(
    isYamlSection || !section ? MAIN_CONFIGURATION : section,
  );

  useEffect(() => {
    if (!section) {
      return;
    }

    if (!isYamlSection) {
      previousSection.current = section;
    }
  }, [section]);

  const handleSwitch = (e: FormEvent<HTMLInputElement>) => {
    if (yamlFormik.values.yaml) {
      openPortal(e);
      return;
    }

    const newSection = isYamlSection
      ? previousSection.current
      : YAML_CONFIGURATION;
    setSection(newSection);
  };

  const handleConfirm = () => {
    void yamlFormik.setFieldValue("yaml", undefined);
    closePortal();
    setSection(previousSection.current);
  };

  return (
    <div
      title={disableReason}
      className={classnames("u-float-left", {
        "is-disabled": disableReason,
      })}
    >
      {isOpen && (
        <Portal>
          <YamlConfirmation onConfirm={handleConfirm} close={closePortal} />
        </Portal>
      )}
      <div className="u-flex">
        <Switch
          label={isSmallScreen ? "YAML" : "YAML Configuration"}
          checked={isYamlSection}
          onChange={handleSwitch}
          disabled={disableReason !== undefined}
        />
      </div>
    </div>
  );
};

export default YamlSwitch;
