import ResourceLabel from "components/ResourceLabel";
import type { ChangeEvent, FC } from "react";
import { useState } from "react";
import type { LxdProject } from "types/project";
import { isProjectEmpty } from "util/projects";
import ProjectUsedByList from "./ProjectUsedByList";
import { ActionButton, Input, Modal } from "@canonical/react-components";

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
  const [confirmInput, setConfirmInput] = useState("");
  const [disableConfirm, setDisableConfirm] = useState(true);

  const isEmpty = isProjectEmpty(project);

  const handleConfirmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === project.name) {
      setDisableConfirm(false);
    } else {
      setDisableConfirm(true);
    }

    setConfirmInput(e.target.value);
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
            value={confirmInput}
            placeholder={project.name}
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
          {`Permanently delete project ${project.name}`}
        </ActionButton>,
      ]}
    >
      <div>
        This will permanently delete project{" "}
        <ResourceLabel type="project" value={project.name} bold />.<br />
        This action cannot be undone, and can result in data loss.
        <br />
        <br />
        {!isEmpty && (
          <>
            The following items will also be deleted:
            <ProjectUsedByList project={project} />
          </>
        )}
        <p>To continue, please type the project name below.</p>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
