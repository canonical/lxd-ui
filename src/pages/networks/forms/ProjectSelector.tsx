import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import type {
  CustomSelectOption,
  CustomSelectProps,
} from "@canonical/react-components";
import type { LxdProject } from "types/project";

interface Props {
  value: string;
  setValue: (value: string) => void;
  projects: LxdProject[];
  hasNoneOption?: boolean;
}

const ProjectSelector: FC<
  Props & Omit<CustomSelectProps, "onChange" | "options" | "value">
> = ({ value, setValue, projects, hasNoneOption = false, ...selectProps }) => {
  const getProjectOptions = () => {
    const options: CustomSelectOption[] = projects.map((project) => {
      return {
        label: (
          <div className="label">
            <span title={project.name} className="project-option u-truncate">
              {project.name}
            </span>
          </div>
        ),
        value: project.name,
        text: project.name,
        disabled: false,
      };
    });

    if (options.length === 0) {
      options.unshift({
        label: <span>No projects available</span>,
        value: "",
        text: "None",
        disabled: true,
      });
    }

    if (hasNoneOption) {
      options.push({
        label: (
          <div className="label">
            <span title="No project" className="project-option u-truncate">
              No project
            </span>
          </div>
        ),
        value: "none",
        text: "No project",
        disabled: false,
      });
    }

    return options;
  };

  const getHeader = () => {
    return (
      <div className="header">
        <span className="project-option u-no-margin--bottom">Name</span>
      </div>
    );
  };

  return (
    <CustomSelect
      label="Project"
      {...selectProps}
      onChange={(e) => {
        setValue(e);
      }}
      value={value}
      options={getProjectOptions()}
      header={getHeader()}
      dropdownClassName="project-select-dropdown"
      aria-label="Project"
    />
  );
};

export default ProjectSelector;
