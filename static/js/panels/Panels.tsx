import React from "react";
import { AnimatePresence } from "framer-motion";
import useEventListener from "@use-it/event-listener";
import "../../sass/_panels.scss";
import usePanelParams, { panels } from "../util/usePanelParams";
import InstanceFormYaml from "./InstanceFormYaml";
import InstanceFormGuided from "./InstanceFormGuided";
import ProfileFormGuided from "./ProfileFormGuided";
import ProfileFormYaml from "./ProfileFormYaml";

export default function Panels() {
  const panelParams = usePanelParams();

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close panel if Escape key is pressed
    if (e.code === "Escape") panelParams.clear();
  });

  const generatePanel = () => {
    switch (panelParams.panel) {
      case panels.instanceFormGuided:
        return <InstanceFormGuided />;
      case panels.instanceFormYaml:
        return <InstanceFormYaml />;
      case panels.profileFormGuided:
        return <ProfileFormGuided />;
      case panels.profileFormYaml:
        return <ProfileFormYaml />;
      default:
        return null;
    }
  };
  return (
    <AnimatePresence>{panelParams.panel && generatePanel()}</AnimatePresence>
  );
}
