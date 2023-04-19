import { LxdInstance } from "types/instance";
import { TestFunction } from "yup";
import { AnyObject } from "yup/lib/types";
import { checkDuplicateName, getTomorrow } from "./helpers";

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
