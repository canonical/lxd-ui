import type { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ProjectSelectTable from "pages/projects/ProjectSelectTable";

interface Props {
  instance: LxdInstance;
  onSelect: (pool: string) => void;
  targetProject: string;
  onCancel: () => void;
  move: (pool: string) => void;
}

const InstanceProjectMove: FC<Props> = ({
  instance,
  onSelect,
  targetProject,
  onCancel,
  move,
}) => {
  const summary = (
    <div className="move-instance-summary">
      <p>
        This will move the instance <strong>{instance.name}</strong> to the
        project <b>{targetProject}</b>.
      </p>
    </div>
  );

  return (
    <>
      {targetProject && summary}
      {!targetProject && (
        <ProjectSelectTable
          onSelect={onSelect}
          disableProject={{
            name: instance.project,
            reason: "Instance already in this project",
          }}
        />
      )}
      <footer id="move-instance-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel move"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => {
            move(targetProject);
          }}
          disabled={!targetProject}
        >
          Move
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceProjectMove;
