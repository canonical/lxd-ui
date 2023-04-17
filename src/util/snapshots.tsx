import { TestFunction } from "yup";
import { AnyObject } from "yup/lib/types";

export interface SnapshotFormValues {
  name: string;
  stateful: boolean;
  expirationDate: string | null;
  expirationTime: string | null;
}

export const getExpiresAt = (
  expirationDate: string,
  expirationTime: string | null
) => {
  expirationTime = expirationTime ?? "00:00";
  return `${expirationDate}T${expirationTime}`;
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
