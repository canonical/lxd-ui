import { LxdInstance } from "types/instance";
import { TestFunction } from "yup";
import { AnyObject } from "yup/lib/types";
import { checkDuplicateName, getTomorrow } from "./helpers";
import * as Yup from "yup";

export interface SnapshotFormValues {
  name: string;
  stateful: boolean;
  expirationDate: string | null;
  expirationTime: string | null;
}

export const isInstanceStateful = (instance: LxdInstance) => {
  return Boolean(instance.config["migration.stateful"]);
};

export const getExpiresAt = (expirationDate: string, expirationTime: string) =>
  `${expirationDate}T${expirationTime}`;

export const testDuplicateName = (
  instance: LxdInstance,
  controllerState: [
    AbortController | null,
    React.Dispatch<React.SetStateAction<AbortController | null>>
  ],
  excludeName?: string
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "Snapshot name already in use",
    (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          instance.project,
          controllerState,
          `instances/${instance.name}/snapshots`
        )
      );
    },
  ];
};

export const testForbiddenChars = (): [
  string,
  string,
  TestFunction<string | undefined, AnyObject>
] => {
  return [
    "forbiddenChars",
    `The snapshot name cannot contain spaces or "/" characters`,
    (value?: string) => {
      if (!value) {
        return true;
      }
      return !(value.includes(" ") || value.includes("/"));
    },
  ];
};

export const testValidDate = (): [
  string,
  string,
  TestFunction<string | null | undefined, AnyObject>
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
  TestFunction<string | null | undefined, AnyObject>
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
  TestFunction<string | null | undefined, AnyObject>
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

export const getSnapshotSchema = (
  instance: LxdInstance,
  controllerState: [
    AbortController | null,
    React.Dispatch<React.SetStateAction<AbortController | null>>
  ],
  snapshotName?: string
) => {
  return Yup.object().shape({
    name: Yup.string()
      .required("This field is required")
      .test(...testDuplicateName(instance, controllerState, snapshotName))
      .test(...testForbiddenChars()),
    expirationDate: Yup.string()
      .nullable()
      .optional()
      .test(...testValidDate())
      .test(...testFutureDate()),
    expirationTime: Yup.string()
      .nullable()
      .optional()
      .test(...testValidTime()),
    stateful: Yup.boolean(),
  });
};
