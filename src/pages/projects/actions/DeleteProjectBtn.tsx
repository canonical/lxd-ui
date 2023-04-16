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

interface Props {
  project: LxdProject;
}

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteProject(project)
      .then(() => {
        navigate(
          `/ui/default/instances`,
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
      isLoading={isLoading}
      icon="delete"
      title="Confirm delete"
      toggleCaption="Delete"
      confirmationMessage={
        <>
          Are you sure you want to delete the project{" "}
          <ItemName item={project} bold />?{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel={
        project.name === "default"
          ? "The default project can't be deleted"
          : "Delete"
      }
      onConfirm={handleDelete}
      isDense={false}
      hasShiftHint={false}
      isDisabled={project.name === "default" || !isProjectEmpty(project)}
    />
  );
};

export default DeleteProjectBtn;
