import { useState, type FC, type ReactNode } from "react";
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
  Tooltip,
  useNotify,
  usePortal,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useProjectEntitlements } from "util/entitlements/projects";
import DeleteProjectModal from "./DeleteProjectModal";
import { ROOT_PATH } from "util/rootPath";
import { useEventQueue } from "context/eventQueue";

const generateTooltipMessage = (
  canDelete: boolean,
  isDefault: boolean,
  isEmpty: boolean,
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

  return "Delete project and all its resources";
};

interface Props {
  project: LxdProject;
}

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isSmallScreen = useIsScreenBelow();
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteProject } = useProjectEntitlements();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const isDefaultProject = project.name === "default";
  const isEmpty = isProjectEmpty(project);

  const handleClosePortal = () => {
    notify.clear();
    closePortal();
  };

  const notifySuccess = () => {
    toastNotify.success(
      <>
        Project <ResourceLabel bold type="project" value={project.name} />{" "}
        deleted.
      </>,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    const isForce = !isEmpty;
    deleteProject(project, isForce)
      .then((operation) => {
        navigate(`${ROOT_PATH}/ui/project/default/instances`);
        toastNotify.info(
          <>
            Deletion of project{" "}
            <ResourceLabel bold type="project" value={project.name} /> has
            started.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          () => {
            notifySuccess();
          },
          (msg) =>
            toastNotify.failure(
              `Deleting project ${project.name} failed`,
              new Error(msg),
            ),
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
        disabled={!canDeleteProject(project) || isDefaultProject || isLoading}
        className="u-no-margin--bottom"
      >
        <Tooltip
          message={generateTooltipMessage(
            canDeleteProject(project),
            isDefaultProject,
            isEmpty,
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
