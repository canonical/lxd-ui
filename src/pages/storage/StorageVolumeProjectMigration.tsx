import type { FC } from "react";
import { ActionButton, Button } from "@canonical/react-components";
import ProjectSelectTable from "pages/projects/ProjectSelectTable";
import type { LxdStorageVolume } from "types/storage";

interface Props {
  volume: LxdStorageVolume;
  onSelect: (pool: string) => void;
  targetProject: string;
  onCancel: () => void;
  migrate: (pool: string) => void;
}

const StorageVolumeProjectMigration: FC<Props> = ({
  volume,
  onSelect,
  targetProject,
  onCancel,
  migrate,
}) => {
  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate the volume <strong>{volume.name}</strong> to the
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
            name: volume.project,
            reason: "Volume already in this project",
          }}
        />
      )}
      <footer id="migrate-volume-actions" className="p-modal__footer">
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
          onClick={() => {
            migrate(targetProject);
          }}
          disabled={!targetProject}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default StorageVolumeProjectMigration;
