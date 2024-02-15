import { AnyObject, TestFunction } from "yup";
import { getTomorrow } from "./helpers";
import { LxdProject } from "types/project";

/*** General snapshot utils ***/
export type SnapshotFormValues<AdditionalProps = unknown> = {
  name: string;
  expirationDate: string | null;
  expirationTime: string | null;
} & {
  [K in keyof AdditionalProps]: AdditionalProps[K];
};

export const getExpiresAt = (
  expirationDate: string,
  expirationTime: string,
): string => `${expirationDate}T${expirationTime}`;

export const testValidDate = (): [
  string,
  string,
  TestFunction<string | null | undefined, AnyObject>,
] => {
  return [
    "valid",
    "Invalid date format",
    (value, context) => {
      if (!value) {
        return !(context.parent as SnapshotFormValues).expirationTime;
      }
      return new Date(value).toString() !== "Invalid Date";
    },
  ];
};

export const testFutureDate = (): [
  string,
  string,
  TestFunction<string | null | undefined, AnyObject>,
] => {
  return [
    "future",
    "The date must be in the future",
    (value?: string | null) => {
      if (!value) return true;
      const date = new Date(value).getTime();
      const tomorrow = new Date(getTomorrow()).getTime();
      return date >= tomorrow;
    },
  ];
};

export const testValidTime = (): [
  string,
  string,
  TestFunction<string | null | undefined, AnyObject>,
] => {
  return [
    "valid",
    "Invalid time format",
    (value, context) => {
      if (!value) {
        return !(context.parent as SnapshotFormValues).expirationDate;
      }
      const [hours, minutes] = value.split(":");
      const date = new Date();
      date.setHours(+hours);
      date.setMinutes(+minutes);
      return date.toString() !== "Invalid Date";
    },
  ];
};

export const isSnapshotsDisabled = (project?: LxdProject): boolean => {
  if (!project) {
    return false;
  }

  if (project.config["restricted"] === "true") {
    if (
      !project.config["restricted.snapshots"] ||
      project.config["restricted.snapshots"] === "block"
    ) {
      return true;
    }
  }

  return false;
};
