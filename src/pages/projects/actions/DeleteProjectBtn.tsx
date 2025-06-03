import type { FC, ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import ItemName from "components/ItemName";
import { isProjectEmpty } from "util/projects";
import { useSmallScreen } from "context/useSmallScreen";
import {
  ConfirmationButton,
  Icon,
  Tooltip,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";
import { useToastNotification } from "context/toastNotificationProvider";
import { filterUsedByType } from "util/usedBy";
import type { ResourceType } from "util/resourceDetails";
import ResourceLabel from "components/ResourceLabel";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  project: LxdProject;
}

const generateProjectUsedByTooltip = (project: LxdProject) => {
  const resourceLabelAndLink: Record<string, { label: string; link: string }> =
    {
      instance: {
        label: "Instances",
        link: `/ui/project/${project.name}/instances`,
      },
      profile: {
        label: "Profiles",
        link: `/ui/project/${project.name}/profiles`,
      },
      image: {
        label: "Images",
        link: `/ui/project/${project.name}/images`,
      },
      volume: {
        label: "Custom volumes",
        link: `/ui/project/${project.name}/storage/volumes`,
      },
    };

  const resourceTypes = Object.keys(resourceLabelAndLink);
  const usedByItems: ReactNode[] = [];
  for (const resourceType of resourceTypes) {
    const usedBy = filterUsedByType(
      resourceType as ResourceType,
      project.used_by,
    );

    if (usedBy.length > 0) {
      const label = resourceLabelAndLink[resourceType].label;
      const link = resourceLabelAndLink[resourceType].link;
      usedByItems.push(
        <li
          key={resourceType}
          className="p-list__item is-dark u-no-margin--bottom"
        >
          {<Link to={link}>{label}</Link>} ({usedBy.length})
        </li>,
      );
    }
  }

  return (
    <>
      Non-empty project cannot be deleted.
      <p className="u-no-margin--bottom">Project is used by:</p>
      <ul className="p-list u-no-margin--bottom">{usedByItems}</ul>
    </>
  );
};

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isSmallScreen = useSmallScreen();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteProject } = useProjectEntitlements();

  const isDefaultProject = project.name === "default";
  const isEmpty = isProjectEmpty(project);
  const getHoverText = () => {
    if (!canDeleteProject(project)) {
      return "You do not have permission to delete this project";
    }
    if (isDefaultProject) {
      return "The default project cannot be deleted";
    }
    if (!isEmpty) {
      return "";
    }
    return "Delete project";
  };

  const handleDelete = () => {
    setLoading(true);
    deleteProject(project)
      .then(() => {
        navigate(`/ui/project/default/instances`);
        toastNotify.success(
          <>
            Project <ResourceLabel bold type="project" value={project.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Project deletion failed", e);
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects],
        });
      });
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={
        !canDeleteProject(project) || isDefaultProject || !isEmpty || isLoading
      }
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
        children: (
          <p>
            This will permanently delete project{" "}
            <ItemName item={project} bold />.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Tooltip
        message={
          !isEmpty && !isDefaultProject
            ? generateProjectUsedByTooltip(project)
            : ""
        }
      >
        {!isSmallScreen && <Icon name="delete" />}
        <span>Delete project</span>
      </Tooltip>
    </ConfirmationButton>
  );
};

export default DeleteProjectBtn;
