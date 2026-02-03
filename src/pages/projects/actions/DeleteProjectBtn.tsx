import type { FC, ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { isProjectEmpty } from "util/projects";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import {
  Button,
  Icon,
  Tooltip,
  useNotify,
  usePortal,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import DeleteProjectModal from "./DeleteProjectModal";
import { filterUsedByType } from "util/usedBy";
import type { ResourceType } from "util/resourceDetails";
import { ROOT_PATH } from "util/rootPath";

const generateTooltipMessage = (
  project: LxdProject,
  canDelete: boolean,
  isDefault: boolean,
  isEmpty: boolean,
  hasForceDelete: boolean,
): ReactNode => {
  if (!canDelete) {
    return "You do not have permission to delete this project";
  }

  if (isDefault) {
    return "The default project cannot be deleted";
  }

  if (isEmpty) {
    return "Delete project";
  }

  if (!hasForceDelete) {
    // Non-empty project without force delete support - show detailed tooltip
    const resourceLabelAndLink: Record<
      string,
      { label: string; link: string }
    > = {
      instance: {
        label: "Instances",
        link: `${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/instances`,
      },
      profile: {
        label: "Profiles",
        link: `${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/profiles`,
      },
      image: {
        label: "Images",
        link: `${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/images`,
      },
      volume: {
        label: "Custom volumes",
        link: `${ROOT_PATH}/ui/project/${encodeURIComponent(project.name)}/storage/volumes`,
      },
    };

    const resourceTypes = Object.keys(resourceLabelAndLink);
    const usedByItems: ReactNode[] = [];

    for (const resourceType of resourceTypes) {
      const usedBy = filterUsedByType(
        resourceType as ResourceType,
        project.used_by?.filter(
          (item) => !item.includes("/1.0/profiles/default"),
        ),
      );

      if (usedBy.length > 0) {
        const label = resourceLabelAndLink[resourceType].label;
        const link = resourceLabelAndLink[resourceType].link;
        usedByItems.push(
          <li
            key={resourceType}
            className="p-list__item is-dark u-no-margin--bottom"
          >
            <Link to={link}>{label}</Link> ({usedBy.length})
          </li>,
        );
      }
    }

    return (
      <>
        Cannot delete non-empty project.
        <br />
        <br />
        Project is used by:
        <ul className="p-list u-no-margin--bottom">{usedByItems}</ul>
        <br />
        Remove all resources first, or upgrade to LXD 6.6 or newer to use force
        deletion.
      </>
    );
  }

  return "Delete project and all its resources";
};

interface Props {
  project: LxdProject;
}

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteProject } = useProjectEntitlements();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { hasProjectForceDelete } = useSupportedFeatures();

  const isDefaultProject = project.name === "default";
  const isEmpty = isProjectEmpty(project);

  const handleClosePortal = () => {
    notify.clear();
    closePortal();
  };

  const handleDelete = () => {
    setLoading(true);
    const force = !isEmpty && hasProjectForceDelete;
    deleteProject(project, force)
      .then(() => {
        navigate(`${ROOT_PATH}/ui/project/default/instances`);
        toastNotify.success(
          <>
            Project <ResourceLabel bold type="project" value={project.name} />{" "}
            deleted.
          </>,
        );
        handleClosePortal();
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Project deletion failed", e);

        // Scroll to top of modal to show error notification
        const modalDialog = document.querySelector(
          ".delete-project-dialog .p-modal__dialog",
        );
        if (modalDialog) {
          modalDialog.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects],
        });
      });
  };

  return (
    <>
      <Button
        onClick={openPortal}
        hasIcon={!isSmallScreen}
        disabled={
          !canDeleteProject(project) ||
          isDefaultProject ||
          isLoading ||
          (!isEmpty && !hasProjectForceDelete)
        }
        className="u-no-margin--bottom"
      >
        <Tooltip
          message={generateTooltipMessage(
            project,
            canDeleteProject(project),
            isDefaultProject,
            isEmpty,
            hasProjectForceDelete,
          )}
        >
          {!isSmallScreen && <Icon name="delete" />}
          <span>Delete project</span>
        </Tooltip>
      </Button>

      {isOpen && (
        <Portal>
          <DeleteProjectModal
            project={project}
            handleDelete={handleDelete}
            isLoading={isLoading}
            closePortal={handleClosePortal}
          />
        </Portal>
      )}
    </>
  );
};

export default DeleteProjectBtn;
