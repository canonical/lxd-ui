import React from "react";
import useEventListener from "@use-it/event-listener";
import "../../sass/_panels.scss";
import usePanelParams, { panels } from "util/usePanelParams";
import InstanceDetailPanel from "pages/instances/InstanceDetailPanel";
import EditInstanceForm from "pages/instances/EditInstanceForm";
import ProfileFormGuided from "pages/profiles/ProfileFormGuided";
import ProfileFormYaml from "pages/profiles/ProfileFormYaml";
import StorageForm from "pages/storages/StorageForm";

export default function Panels() {
  const panelParams = usePanelParams();

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close panel if Escape key is pressed
    if (e.code === "Escape") panelParams.clear();
  });

  const generatePanel = () => {
    switch (panelParams.panel) {
      case panels.instanceSummary:
        return <InstanceDetailPanel />;
      case panels.editInstance:
        return <EditInstanceForm />;
      case panels.profileFormGuided:
        return <ProfileFormGuided />;
      case panels.profileFormYaml:
        return <ProfileFormYaml />;
      case panels.storageForm:
        return <StorageForm />;
      default:
        return null;
    }
  };
  return <>{panelParams.panel && generatePanel()}</>;
}
