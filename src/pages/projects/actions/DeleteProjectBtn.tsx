import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { isProjectEmpty } from "util/projects";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import {
  Button,
  Icon,
  useNotify,
  usePortal,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useProjectEntitlements } from "util/entitlements/projects";
import DeleteProjectModal from "./DeleteProjectModal";

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
      return "Delete project and all its resources";
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
        closePortal();
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
    <>
      <Button
        onClick={() => {
          openPortal();
        }}
        title={getHoverText()}
        hasIcon={!isSmallScreen}
        disabled={!canDeleteProject(project) || isDefaultProject || isLoading}
        className="u-no-margin--bottom"
      >
        <Icon name="delete" />
        <span>Delete project</span>
      </Button>

      {isOpen && (
        <Portal>
          <DeleteProjectModal
            project={project}
            handleDelete={handleDelete}
            isLoading={isLoading}
            closePortal={closePortal}
          />
        </Portal>
      )}
    </>
  );
};

export default DeleteProjectBtn;
