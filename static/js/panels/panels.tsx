import React from "react";
import { AnimatePresence } from "framer-motion";
import { StringParam, useQueryParam } from "use-query-params";
import useEventListener from "@use-it/event-listener";
import InstanceForm from "./InstanceForm";
import "../../sass/_panels.scss";
import { panelQueryParams } from "../util/panelQueryParams";
import ImageAdd from "./ImageAdd/ImageAdd";
import SnapshotList from "./SnapshotList";

export default function Panels() {
  const [panelQs, setPanelQs] = useQueryParam("panel", StringParam);

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close panel if Escape key is pressed when panel active
    if (e.code === "Escape") {
      setPanelQs(undefined);
    }
  });

  const generatePanel = () => {
    switch (panelQs) {
      case panelQueryParams.instanceForm:
        return <InstanceForm />;
      case panelQueryParams.imageImport:
        return <ImageAdd />;
        case panelQueryParams.snapshots:
          return <SnapshotList />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs && generatePanel()}</AnimatePresence>;
}
