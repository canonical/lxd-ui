import React, { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import ItemName from "components/ItemName";
import { isProjectEmpty } from "util/projects";
import { useDeleteIcon } from "context/useDeleteIcon";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  project: LxdProject;
}

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isDeleteIcon = useDeleteIcon();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isDefaultProject = project.name === "default";
  const isEmpty = isProjectEmpty(project);
  const getHoverText = () => {
    if (isDefaultProject) {
      return "The default project cannot be deleted";
    }
    if (!isEmpty) {
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
      appearance={isDeleteIcon ? "base" : "default"}
      className={classnames("u-no-margin--bottom", {
        "has-icon": isDeleteIcon,
      })}
      loading={isLoading}
      disabled={isDefaultProject || !isEmpty}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
        children: (
          <>
            This will permanently delete project{" "}
            <ItemName item={project} bold />.<br />
            This action cannot be undone, and can result in data loss.
          </>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      {isDeleteIcon && <Icon name="delete" />}
      {!isDeleteIcon && <span>Delete project</span>}
    </ConfirmationButton>
  );
};

export default DeleteProjectBtn;
