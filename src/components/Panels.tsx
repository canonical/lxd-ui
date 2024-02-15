import useEventListener from "@use-it/event-listener";
import usePanelParams, { panels } from "util/usePanelParams";
import InstanceDetailPanel from "pages/instances/InstanceDetailPanel";
import ProfileDetailPanel from "pages/profiles/ProfileDetailPanel";

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
      case panels.profileSummary:
        return <ProfileDetailPanel />;
      default:
        return null;
    }
  };
  return <>{panelParams.panel && generatePanel()}</>;
}
