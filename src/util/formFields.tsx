import type { LxdProfile } from "types/profile";
import type { LxdInstance } from "types/instance";
import type { OptionHTMLAttributes } from "react";
import type { LxdConfigPair } from "types/config";
import type { LxdProject } from "types/project";
import type { LxdStorageVolume } from "types/storage";

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
    Object.entries(item).filter(
      ([key]) =>
        !handledKeys.has(key) && !key.startsWith("cloud-init.ssh-keys."),
    ),
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

export const focusField = (name: string) => {
  setTimeout(() => document.getElementById(name)?.focus(), 100);
};
