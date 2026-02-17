import ResourceLabel from "components/ResourceLabel";
import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { useState } from "react";
import type { LxdProject } from "types/project";
import { isProjectEmpty } from "util/projects";
import ProjectUsedBy from "pages/projects/actions/ProjectUsedBy";
import {
  ActionButton,
  Input,
  Modal,
  NotificationConsumer,
} from "@canonical/react-components";

interface Props {
  project: LxdProject;
  handleDelete: () => void;
  isLoading: boolean;
  closePortal: () => void;
}

const DeleteProjectModal: FC<Props> = ({
  project,
  handleDelete,
  isLoading,
  closePortal,
}) => {
  const [disableConfirm, setDisableConfirm] = useState(true);

  const isEmpty = isProjectEmpty(project);

  const handleConfirmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisableConfirm(e.target.value !== project.name);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disableConfirm && !isLoading) {
      handleDelete();
    }
  };

  return (
    <Modal
      title="Confirm delete"
      className="delete-project-dialog"
      close={closePortal}
      buttonRow={[
        <span className="u-float-left confirm-input" key="confirm-input">
          <Input
            name="confirm-delete-project-input"
            type="text"
            onChange={handleConfirmInputChange}
            onKeyDown={handleKeyDown}
            placeholder={project.name}
            className="u-no-margin--bottom"
          />
        </span>,
        <ActionButton
          key="confirm-action-button"
          appearance="negative"
          className="u-no-margin--bottom"
          onClick={handleDelete}
          loading={isLoading}
          disabled={disableConfirm}
        >
          Permanently delete
        </ActionButton>,
      ]}
    >
      <NotificationConsumer />
      <p>
        This will permanently delete project{" "}
        <ResourceLabel type="project" value={project.name} bold />.<br />
        This action cannot be undone, and can result in data loss.
      </p>
      {!isEmpty && (
        <>
          The following items will also be deleted:
          <ProjectUsedBy project={project} />
        </>
      )}
      <p>To continue, please type the project name below.</p>
    </Modal>
  );
};

export default DeleteProjectModal;
