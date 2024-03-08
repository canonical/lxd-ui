import { LxdProfile } from "types/profile";
import { LxdInstance } from "types/instance";
import { OptionHTMLAttributes } from "react";
import { LxdConfigPair } from "types/config";
import { LxdProject } from "types/project";
import { LxdStorageVolume } from "types/storage";

export const getUnhandledKeyValues = (
  item:
    | LxdConfigPair
    | LxdInstance
    | LxdProfile
    | LxdProject
    | LxdStorageVolume,
  handledKeys: Set<string>,
) => {
  return Object.fromEntries(
    Object.entries(item).filter(([key]) => !handledKeys.has(key)),
  );
};

const collapsedViewMaxWidth = 1420;
export const figureCollapsedScreen = (): boolean =>
  window.innerWidth <= collapsedViewMaxWidth;

export const optionRenderer = (
  value?: unknown,
  optionList?: OptionHTMLAttributes<HTMLOptionElement>[],
): string => {
  const match = optionList?.find((item) => item.value === value);
  if (match?.label && value !== "") {
    return match.label;
  }

  return "";
};
