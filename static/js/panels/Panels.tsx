import React from "react";
import { AnimatePresence } from "framer-motion";
import useEventListener from "@use-it/event-listener";
import "../../sass/_panels.scss";
import ImageAdd from "./ImageAdd/ImageAdd";
import usePanelParams, { panels } from "../util/usePanelParams";
import ProfileForm from "./ProfileForm";
import InstanceFormYaml from "./InstanceFormYaml";
import InstanceFormGuided from "./InstanceFormGuided";

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
      case panels.imageImport:
        return <ImageAdd />;
      case panels.profileForm:
        return <ProfileForm />;
      default:
        return null;
    }
  };
  return (
    <AnimatePresence>{panelParams.panel && generatePanel()}</AnimatePresence>
  );
}
