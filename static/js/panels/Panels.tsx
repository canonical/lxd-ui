import React from "react";
import { AnimatePresence } from "framer-motion";
import useEventListener from "@use-it/event-listener";
import InstanceForm from "./InstanceForm";
import "../../sass/_panels.scss";
import ImageAdd from "./ImageAdd/ImageAdd";
import SnapshotList from "./SnapshotList";
import usePanelParams, { panels } from "../util/usePanelParams";

export default function Panels() {
  const panelParams = usePanelParams();

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close panel if Escape key is pressed
    if (e.code === "Escape") panelParams.clear();
  });

  const generatePanel = () => {
    switch (panelParams.panel) {
      case panels.instanceForm:
        return <InstanceForm />;
      case panels.imageImport:
        return <ImageAdd />;
      case panels.snapshots:
        return <SnapshotList />;
      default:
        return null;
    }
  };
  return (
    <AnimatePresence>{panelParams.panel && generatePanel()}</AnimatePresence>
  );
}
