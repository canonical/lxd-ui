import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { useNavigate } from "react-router-dom";
import { useNotify } from "context/notify";
import { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import ItemName from "components/ItemName";
import { isProjectEmpty } from "util/projects";
import { useDeleteIcon } from "context/useDeleteIcon";

interface Props {
  project: LxdProject;
}

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isDeleteIcon = useDeleteIcon();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getHoverText = () => {
    if (project.name === "default") {
      return "The default project cannot be deleted";
    }
    if (!isProjectEmpty(project)) {
      return "Non-empty projects cannot be deleted";
    }
    return "Delete project";
  };

  const handleDelete = () => {
    setLoading(true);
    deleteProject(project)
      .then(() => {
        navigate(
          `/ui/project/default/instances`,
          notify.queue(notify.success(`Project ${project.name} deleted.`))
        );
      })
      .catch((e) => {
        notify.failure("Project deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.projects],
        });
      });
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      toggleAppearance={isDeleteIcon ? "base" : "default"}
      className="u-no-margin--bottom"
      isLoading={isLoading}
      title="Confirm delete"
      toggleCaption={isDeleteIcon ? undefined : "Delete project"}
      confirmMessage={
        <>
          Are you sure you want to delete the project{" "}
          <ItemName item={project} bold />?{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={project.name === "default" || !isProjectEmpty(project)}
      isDense={false}
      icon={isDeleteIcon ? "delete" : undefined}
    />
  );
};

export default DeleteProjectBtn;
