import { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ProjectSelectTable from "pages/projects/ProjectSelectTable";

interface Props {
  instance: LxdInstance;
  onSelect: (pool: string) => void;
  targetProject: string;
  onCancel: () => void;
  migrate: (pool: string) => void;
}

const InstanceProjectMigration: FC<Props> = ({
  instance,
  onSelect,
  targetProject,
  onCancel,
  migrate,
}) => {
  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate the instance <strong>{instance.name}</strong> to the
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
      <footer id="migrate-instance-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel migrate"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => migrate(targetProject)}
          disabled={!targetProject}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceProjectMigration;
