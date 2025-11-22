import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Icon,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import { useProjects } from "context/useProjects";
import {
  ALL_PROJECTS,
  getDefaultProject,
  getLoginProject,
  loadLoginProject,
  saveLoginProject,
} from "util/loginProject";
import ResourceLabel from "components/ResourceLabel";
import type { ConfigField } from "types/config";

interface Props {
  configField: ConfigField;
}

const LoginProjectSelect: FC<Props> = ({ configField }) => {
  const [isEditMode, setEditMode] = useState(false);
  const { data: projects = [] } = useProjects();
  const [value, setValue] = useState<string>(loadLoginProject() || "");
  const toastNotify = useToastNotification();

  const projectOptions = [
    {
      label: "All projects",
      value: ALL_PROJECTS,
    },
    ...projects.map((project) => ({
      label: project.name,
      value: project.name,
    })),
  ];

  const canBeReset = String(configField.default) !== String(value);

  const handleSave = () => {
    saveLoginProject(value);

    const settingLabel = (
      <ResourceLabel bold type="setting" value={configField.key} />
    );
    toastNotify.success(<>Setting {settingLabel} updated.</>);
    setEditMode(false);
  };

  const resetToDefault = () => {
    setValue(configField.default || "");
  };

  const onCancel = () => {
    setValue(loadLoginProject() || "");
    setEditMode(false);
  };

  useEffect(() => {
    if (!isEditMode) {
      setValue(loadLoginProject() || "");
      return;
    }
    setValue(getLoginProject(projects));
  }, [isEditMode, projects]);

  return (
    <>
      {isEditMode && (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Select
            name={`${configField.key}-select`}
            aria-label={configField.key}
            options={projectOptions}
            value={value}
            onChange={(e) => {
              setValue((e.target as HTMLSelectElement).value);
            }}
          />
          <Button appearance="base" onClick={onCancel}>
            Cancel
          </Button>
          <Button appearance="positive" type="submit">
            Save
          </Button>
          {canBeReset && (
            <Button
              className="reset-button"
              appearance="base"
              onClick={resetToDefault}
              hasIcon
            >
              <Icon name="restart" className="flip-horizontally" />
              <span>Reset to default</span>
            </Button>
          )}
        </Form>
      )}
      {!isEditMode && (
        <Button
          appearance="base"
          className="readmode-button u-no-margin"
          onClick={() => {
            setEditMode(true);
          }}
          hasIcon
        >
          <div className="readmode-value u-truncate">
            {value === ALL_PROJECTS
              ? "All projects"
              : value || getDefaultProject(projects)}
          </div>
          <Icon name="edit" className="edit-icon" />
        </Button>
      )}
    </>
  );
};

export default LoginProjectSelect;
