import type { OptionHTMLAttributes } from "react";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

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

export const hasPrefixValue = (
  formik: InstanceAndProfileFormikProps,
  keyPrefix: string,
  ignoreKey?: string,
): boolean => {
  return Object.entries(formik.values).some(
    ([key, value]) =>
      key.startsWith(keyPrefix) && value !== undefined && key !== ignoreKey,
  );
};
