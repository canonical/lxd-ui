import { Button, Icon, Modal, usePortal } from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useEffect } from "react";
import { useSettings } from "context/useSettings";
import { useProject } from "context/useProjects";

const ProjectPermissionWarning = () => {
  const { isLoading: isSettingsLoading } = useSettings();
  const { project, isLoading: isProjectLoading } = useCurrentProject();
  const { data: defaultProject, isLoading: isDefaultProjectLoading } =
    useProject("default", !project);

  const { canViewEvents, canViewOperations } = useProjectEntitlements();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  const currentProject = project ?? defaultProject;
  const isLoading =
    isProjectLoading || isSettingsLoading || isDefaultProjectLoading;
  const hasPermissions =
    canViewEvents(currentProject) && canViewOperations(currentProject);
  const hasWarning = !isLoading && !hasPermissions;

  useEffect(() => {
    if (hasWarning) {
      openPortal();
    }
  }, [hasWarning]);

  if (!hasWarning) {
    return null;
  }

  return (
    <div>
      <Button
        onClick={() => {
          openPortal();
        }}
        appearance="base"
        className="u-no-margin--bottom"
        title="Missing viewer permission"
        small
      >
        <Icon name="warning" className="is-light" />
      </Button>
      {isOpen && (
        <Portal>
          <Modal title="Missing viewer permission" close={closePortal}>
            <p>
              You do not have the <code>viewer</code> permission for the
              selected project.
            </p>
            <p>
              Changes made in the UI will not be visible without manual reload
              of the page.
            </p>
            <p>
              Your UI experience is limited because of that. Contact your
              administrator to add the necessary permissions for your user.
            </p>
            <footer className="p-modal__footer" id="modal-footer">
              <Button
                appearance="positive"
                className="u-no-margin--bottom"
                onClick={closePortal}
              >
                Accept
              </Button>
            </footer>
          </Modal>
        </Portal>
      )}
    </div>
  );
};

export default ProjectPermissionWarning;
