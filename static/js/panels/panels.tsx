import React from "react";
import { AnimatePresence } from "framer-motion";
import { StringParam, useQueryParams } from "use-query-params";
import useEventListener from "@use-it/event-listener";
import InstanceForm from "./InstanceForm";
import "../../sass/_panels.scss";
import { panelQueryParams } from "../util/panelQueryParams";
import ImageAdd from "./ImageAdd/ImageAdd";
import SnapshotList from "./SnapshotList";

type QueryString = {
  [key: string]: string | undefined;
};

export const panelQueryMap = {
  panel: StringParam,
  instance: StringParam,
};

export const getPanelQsRemovalObj = () => {
  const removalObj: QueryString = {};
  Object.keys(panelQueryMap).forEach((queryString: string) => {
    removalObj[queryString] = undefined;
  });
  return removalObj;
};

export default function Panels() {
  const [panelQs, setPanelQs] = useQueryParams(panelQueryMap);

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close panel if Escape key is pressed when panel active
    if (e.code === "Escape") setPanelQs(getPanelQsRemovalObj());
  });

  const generatePanel = () => {
    switch (panelQs.panel) {
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
