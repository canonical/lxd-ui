import React from "react";
import { AnimatePresence } from "framer-motion";
import { StringParam, useQueryParam } from "use-query-params";
import useEventListener from "@use-it/event-listener";
import InstanceForm from "./InstanceForm";
import "../../sass/_panels.scss";
import { panelQueryParams } from "./queryparams";

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
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs && generatePanel()}</AnimatePresence>;
}
