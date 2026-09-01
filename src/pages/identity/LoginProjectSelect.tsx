import { useState, type FC } from "react";
import {
  Button,
  Form,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import { useProjects } from "context/useProjects";
import { ALL_PROJECTS } from "util/projects";
import {
  getDefaultProject,
  getLoginProject,
  loadLoginProject,
  saveLoginProject,
} from "util/loginProject";
import DsIcon from "components/DsIcon";

const LoginProjectSelect: FC = () => {
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

  const defaultProject = getDefaultProject(projects);
  const canBeReset = defaultProject !== value;

  const handleSave = () => {
    saveLoginProject(value);

    toastNotify.success(<>Login project updated.</>);
    setEditMode(false);
  };

  const resetToDefault = () => {
    setValue(defaultProject);
  };

  const onCancel = () => {
    setValue(loadLoginProject() || "");
    setEditMode(false);
  };

  const onEdit = () => {
    setValue(getLoginProject(projects));
    setEditMode(true);
  };

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
            name="login-project-select"
            aria-label="Login project"
            options={projectOptions}
            value={value}
            onChange={(e) => {
              setValue((e.target as HTMLSelectElement).value);
            }}
          />
          <Button appearance="base" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button appearance="positive" type="submit">
            Save
          </Button>
          {canBeReset && (
            <Button
              className="reset-button"
              appearance="base"
              type="button"
              onClick={resetToDefault}
              hasIcon
            >
              <DsIcon icon="restart" className="flip-horizontally" />
              <span>Reset to default</span>
            </Button>
          )}
        </Form>
      )}
      {!isEditMode && (
        <Button
          appearance="base"
          className="readmode-button u-no-margin"
          onClick={onEdit}
          title="Edit login project"
          hasIcon
        >
          <div className="readmode-value u-truncate">
            {value === ALL_PROJECTS
              ? "All projects"
              : value || getDefaultProject(projects)}
          </div>
          <DsIcon icon="edit" className="edit-icon" />
        </Button>
      )}
    </>
  );
};

export default LoginProjectSelect;
