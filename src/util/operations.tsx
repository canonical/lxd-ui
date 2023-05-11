import { LxdOperation } from "types/operation";

export const getInstanceName = (operation: LxdOperation): string => {
  return (
    operation.resources?.instances
      ?.map((item) => item.split("/").pop())
      .pop() ?? ""
  );
};
